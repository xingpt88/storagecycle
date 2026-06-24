// Cloudflare Pages Function — 实时报价代理
// GET /api/quotes?symbols=MU,000660.KS,285A.T
// 在服务器端拉取 Yahoo Finance（避开浏览器 CORS），返回标准化 JSON。
// 研究类数据（合约价/目标价等）无免费实时源，仍由静态数据维护。

const ALLOWED = new Set([
  "MU", "SNDK", "WDC", "STX",
  "000660.KS", "005930.KS", "285A.T",
]);

async function fetchOne(symbol) {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&range=ytd`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json",
    },
    // 边缘缓存 60s，避免每次访问都打 Yahoo
    cf: { cacheTtl: 60, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`yahoo ${symbol} ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error(`no result ${symbol}`);

  const meta = r.meta;
  // 当年日线收盘序列（去掉空值）。range=ytd 时 chartPreviousClose 是去年收盘，
  // 不能用作"当日"涨跌的基准，须用序列里的前一交易日收盘价。
  const closes = (r.indicators?.quote?.[0]?.close ?? []).filter((c) => typeof c === "number");
  const price = meta.regularMarketPrice ?? closes[closes.length - 1];

  // YTD 基准：去年最后一个交易日收盘（range=ytd 时即 chartPreviousClose），
  // 退化时用今年首根收盘。
  const lastYearClose = meta.chartPreviousClose ?? (closes.length ? closes[0] : null);
  // 前一交易日收盘：序列倒数第二根（盘中时最后一根是今日在成形）。
  const prevClose =
    closes.length >= 2 ? closes[closes.length - 2] : (meta.chartPreviousClose ?? null);

  const dayPct = prevClose ? ((price - prevClose) / prevClose) * 100 : null;
  const ytdPct = lastYearClose ? ((price - lastYearClose) / lastYearClose) * 100 : null;

  return {
    symbol,
    currency: meta.currency || "USD",
    price,
    prevClose,
    dayPct,
    ytdPct,
    marketState: meta.marketState || null,
    t: meta.regularMarketTime || null,
  };
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const raw = (searchParams.get("symbols") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const symbols = raw.filter((s) => ALLOWED.has(s));

  if (!symbols.length) {
    return json({ error: "no valid symbols" }, 400);
  }

  const settled = await Promise.allSettled(symbols.map(fetchOne));
  const quotes = {};
  const errors = {};
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") quotes[s.value.symbol] = s.value;
    else errors[symbols[i]] = String(s.reason?.message || s.reason);
  });

  return json(
    { asOf: new Date().toISOString(), quotes, errors: Object.keys(errors).length ? errors : undefined },
    200,
    { "Cache-Control": "public, max-age=30, s-maxage=60" }
  );
}

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...extra,
    },
  });
}

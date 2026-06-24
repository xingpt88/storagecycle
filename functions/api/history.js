// Cloudflare Pages Function — YTD 日线序列代理（用于走势对比图）
// GET /api/history?symbols=MU,000660.KS,...
// 返回每个标的的去年收盘基准 + 当年日线收盘序列，前端据此 rebase 成 YTD %。

const ALLOWED = new Set([
  "MU", "SNDK", "WDC", "STX",
  "000660.KS", "005930.KS", "285A.T",
]);

async function fetchSeries(symbol) {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&range=ytd`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json",
    },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`yahoo ${symbol} ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error(`no result ${symbol}`);

  const ts = r.timestamp ?? [];
  const closes = r.indicators?.quote?.[0]?.close ?? [];
  const baseline = r.meta.chartPreviousClose ?? null;

  // 对齐时间戳与收盘价，丢掉空值；用每日 UTC 日期（秒）作为 time。
  const points = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (typeof c === "number" && typeof ts[i] === "number") {
      points.push([Math.floor(ts[i]), +c.toFixed(4)]);
    }
  }
  return { symbol, currency: r.meta.currency || "USD", baseline, points };
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const raw = (searchParams.get("symbols") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const symbols = raw.filter((s) => ALLOWED.has(s));
  if (!symbols.length) return json({ error: "no valid symbols" }, 400);

  const settled = await Promise.allSettled(symbols.map(fetchSeries));
  const series = {};
  const errors = {};
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") series[s.value.symbol] = s.value;
    else errors[symbols[i]] = String(s.reason?.message || s.reason);
  });

  return json(
    { asOf: new Date().toISOString(), series, errors: Object.keys(errors).length ? errors : undefined },
    200,
    { "Cache-Control": "public, max-age=120, s-maxage=300" }
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

// Cloudflare Pages Function — 实时基本面（分析师共识目标价 + TTM 财务）
// GET /api/fundamentals?symbols=MU,000660.KS,...
// 经 Yahoo quoteSummary（需 crumb 握手）取得真实值：
//   分析师共识目标价/区间/人数、评级、TTM 营收、毛利率、营业利润率。
// 这些是"核心数据"里少数有免费实时源的部分；合约价/现货价等仍无免费源。

const ALLOWED = new Set([
  "MU", "SNDK", "WDC", "STX",
  "000660.KS", "005930.KS", "285A.T",
]);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

async function getCrumb() {
  const c = await fetch("https://fc.yahoo.com/", { headers: { "User-Agent": UA } });
  const setCookies = typeof c.headers.getSetCookie === "function" ? c.headers.getSetCookie() : [];
  const cookie = setCookies.map((s) => s.split(";")[0]).join("; ");
  const cr = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
    headers: { "User-Agent": UA, Cookie: cookie },
  });
  const crumb = (await cr.text()).trim();
  if (!crumb || crumb.length > 40) throw new Error("crumb failed");
  return { crumb, cookie };
}

async function fetchFund(symbol, crumb, cookie) {
  const modules =
    "financialData,price,incomeStatementHistoryQuarterly,calendarEvents,defaultKeyStatistics";
  const url =
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}` +
    `?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Cookie: cookie },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`${symbol} ${res.status}`);
  const j = await res.json();
  const r = j?.quoteSummary?.result?.[0];
  if (!r) throw new Error(`${symbol} no result`);
  const f = r.financialData || {};
  const p = r.price || {};
  const ks = r.defaultKeyStatistics || {};
  const ce = r.calendarEvents || {};

  // 最新季度利润表（拿当季营收 + 净利率 + 季度末日期）
  const q = (r.incomeStatementHistoryQuarterly || {}).incomeStatementHistory || [];
  const q0 = q[0] || {};
  const qRevRaw = q0.totalRevenue?.raw ?? null;
  const qNetRaw = q0.netIncome?.raw ?? null;
  const qNetMargin = qRevRaw && qNetRaw != null ? (qNetRaw / qRevRaw) * 100 : null;

  // 财报日：calendarEvents.earnings.earningsDate（unix 秒数组；前端按今天判断"下次/上次"）
  const earningsDates = (ce.earnings?.earningsDate || [])
    .map((d) => d?.raw)
    .filter((x) => typeof x === "number");

  return {
    symbol,
    currency: p.currency || "USD",
    price: p.regularMarketPrice?.raw ?? null,
    // 分析师共识 + TTM
    targetMean: f.targetMeanPrice?.raw ?? null,
    targetHigh: f.targetHighPrice?.raw ?? null,
    targetLow: f.targetLowPrice?.raw ?? null,
    numAnalysts: f.numberOfAnalystOpinions?.raw ?? null,
    recommendation: f.recommendationKey ?? null,
    revenue: f.totalRevenue?.fmt ?? null,
    revenueRaw: f.totalRevenue?.raw ?? null,
    grossMargin: f.grossMargins?.fmt ?? null,
    opMargin: f.operatingMargins?.fmt ?? null,
    // 最新财报
    quarterEnd: (q0.endDate?.fmt ?? ks.mostRecentQuarter?.fmt) ?? null,
    qRevenue: q0.totalRevenue?.fmt ?? null,
    qRevenueRaw: qRevRaw,
    qNetMargin,
    earningsDates,
  };
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const symbols = (searchParams.get("symbols") || "")
    .split(",").map((s) => s.trim()).filter((s) => ALLOWED.has(s));
  if (!symbols.length) return json({ error: "no valid symbols" }, 400);

  let crumb, cookie;
  try {
    ({ crumb, cookie } = await getCrumb());
  } catch (e) {
    return json({ error: "auth", detail: String(e?.message || e) }, 200,
      { "Cache-Control": "public, max-age=30" });
  }

  const settled = await Promise.allSettled(symbols.map((s) => fetchFund(s, crumb, cookie)));
  const data = {};
  const errors = {};
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") data[s.value.symbol] = s.value;
    else errors[symbols[i]] = String(s.reason?.message || s.reason);
  });

  return json(
    { asOf: new Date().toISOString(), data, errors: Object.keys(errors).length ? errors : undefined },
    200,
    { "Cache-Control": "public, max-age=180, s-maxage=300" }
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

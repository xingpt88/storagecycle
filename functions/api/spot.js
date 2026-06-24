// Cloudflare Pages Function — 读取现货报价（来自 D1，由爬虫写入）
// GET /api/spot                 → 最新一天的全部品项快照
// GET /api/spot?item=<item名>   → 某品项近 60 天历史（画走势用）
export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return json({ error: "D1 binding 'DB' 未配置" }, 500);
  }

  const { searchParams } = new URL(context.request.url);
  const item = searchParams.get("item");

  try {
    if (item) {
      const { results } = await db
        .prepare(
          "SELECT date, session_avg, change_pct, trend FROM spot_prices WHERE item = ? ORDER BY date DESC LIMIT 60"
        )
        .bind(item)
        .all();
      return json({ item, history: results });
    }

    // 最新一天的快照（两类全部品项）
    const { results } = await db
      .prepare(
        "SELECT * FROM spot_prices WHERE date = (SELECT MAX(date) FROM spot_prices) ORDER BY category, item"
      )
      .all();

    return json({ asOf: results[0]?.date ?? null, count: results.length, rows: results });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=1800",
    },
  });
}

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

    // 每个品项取各自最新一条（DRAM/NAND 更新日可能不同）
    const { results } = await db
      .prepare(
        `SELECT s.* FROM spot_prices s
         JOIN (SELECT item, MAX(date) AS d FROM spot_prices GROUP BY item) m
           ON s.item = m.item AND s.date = m.d
         ORDER BY s.category, s.item`
      )
      .all();

    const asOf = results.reduce((a, r) => (r.date > a ? r.date : a), "");
    return json({ asOf: asOf || null, count: results.length, rows: results });
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

/**
 * storage-cycle 现货价爬虫 Worker
 * - scheduled(): 每日 cron 触发，爬 TrendForce 现货价写入 D1
 * - fetch(/run): 手动触发一次（测试用）
 * 解析逻辑共用 ../../scraper/lib.ts（本地脚本也用同一份）。
 */
import { scrapeAll } from "./lib";

async function runAndStore(env: Env): Promise<number> {
	const rows = await scrapeAll();
	if (!rows.length) return 0;

	const stmt = env.DB.prepare(
		`INSERT OR REPLACE INTO spot_prices
		 (date,category,item,vendors,daily_high,daily_low,session_high,session_low,session_avg,change_pct,trend,scraped_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
	);
	await env.DB.batch(
		rows.map((r) =>
			stmt.bind(
				r.date,
				r.category,
				r.item,
				r.vendors,
				r.daily_high,
				r.daily_low,
				r.session_high,
				r.session_low,
				r.session_avg,
				r.change_pct,
				r.trend,
				r.scraped_at,
			),
		),
	);
	return rows.length;
}

export default {
	// 每日 cron
	async scheduled(_event, env, ctx): Promise<void> {
		ctx.waitUntil(
			runAndStore(env).then(
				(n) => console.log(`scheduled: stored ${n} rows`),
				(e) => console.error("scheduled failed:", e),
			),
		);
	},

	// 手动触发 / 健康检查
	async fetch(request, env): Promise<Response> {
		const { pathname } = new URL(request.url);
		if (pathname === "/run") {
			try {
				const stored = await runAndStore(env);
				return Response.json({ ok: true, stored });
			} catch (e) {
				return Response.json(
					{ ok: false, error: String((e as Error)?.message ?? e) },
					{ status: 500 },
				);
			}
		}
		return new Response(
			"storage-cycle scraper · GET /run 手动爬一次 · cron 每日 02:00 UTC 自动跑",
		);
	},
} satisfies ExportedHandler<Env>;

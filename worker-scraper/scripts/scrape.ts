/**
 * 本地手动跑现货价爬虫（解析逻辑共用 ./lib.ts，与 cron Worker 同一份）
 *
 *   npm run scrape           抓 DRAM+NAND 现货，写入远端 D1
 *   npm run scrape -- --dry  只抓+打印，不写库（调 parsing 时用）
 *   npm run scrape -- --local 写入本地 D1（测试用）
 *
 * 注：日常自动更新由 worker-scraper（cron Worker）负责；本脚本用于手动/调试。
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { scrapeAll, type Row } from "../src/lib";

const sqlStr = (s: string | null) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const sqlNum = (n: number | null) => (n == null ? "NULL" : String(n));

function toSql(rows: Row[]): string {
  const values = rows
    .map(
      (r) =>
        `(${sqlStr(r.date)},${sqlStr(r.category)},${sqlStr(r.item)},${sqlStr(r.vendors)},` +
        `${sqlNum(r.daily_high)},${sqlNum(r.daily_low)},${sqlNum(r.session_high)},${sqlNum(r.session_low)},${sqlNum(r.session_avg)},` +
        `${sqlStr(r.change_pct)},${sqlStr(r.trend)},${sqlStr(r.scraped_at)})`,
    )
    .join(",\n");
  return (
    "INSERT OR REPLACE INTO spot_prices\n" +
    "(date,category,item,vendors,daily_high,daily_low,session_high,session_low,session_avg,change_pct,trend,scraped_at)\n" +
    `VALUES\n${values};`
  );
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const local = args.includes("--local");

  const rows = await scrapeAll();
  if (!rows.length) {
    console.error("没抓到任何数据 —— 页面可能改版，检查 scraper/lib.ts 的 parseSpot");
    process.exit(1);
  }

  if (dry) {
    console.table(rows.map((r) => ({ cat: r.category, item: r.item, avg: r.session_avg, chg: r.change_pct })));
    console.log(`\n[--dry] 共 ${rows.length} 行，未写库`);
    return;
  }

  const file = "/tmp/spot_insert.sql";
  writeFileSync(file, toSql(rows));
  console.log(`写入 ${rows.length} 行 → D1 (${local ? "本地" : "远端"})…`);
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "storage-cycle-prices", local ? "--local" : "--remote", "--yes", "--file", file],
    { stdio: "inherit" },
  );
  console.log("✅ 完成");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

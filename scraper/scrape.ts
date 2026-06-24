/**
 * TrendForce 公开现货价 → D1 爬虫（本地跑）
 *
 *   npm run scrape           抓 DRAM+NAND 现货，写入远端 D1
 *   npm run scrape -- --dry  只抓+打印，不写库（调 parsing 时用）
 *   npm run scrape -- --local 写入本地 D1（wrangler 本地 sqlite，测试用）
 *
 * 数据来自 TrendForce 公开现货页（server-rendered HTML），仅供研究参考。
 */
import * as cheerio from "cheerio";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const SOURCES = [
  { url: "https://www.trendforce.com/price/dram/dram_spot", category: "dram" },
  { url: "https://www.trendforce.com/price/flash/wafer_spot", category: "nand" },
];

interface Row {
  date: string;
  category: string;
  item: string;
  vendors: string;
  daily_high: number | null;
  daily_low: number | null;
  session_high: number | null;
  session_low: number | null;
  session_avg: number | null;
  change_pct: string;
  trend: string;
  scraped_at: string;
}

const num = (s: string | undefined): number | null => {
  const v = parseFloat((s ?? "").replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
};

// ── 解析单个现货页（要改 parsing 就改这里）──
async function scrapeOne(url: string, category: string): Promise<Row[]> {
  const html = await fetch(url, { headers: { "User-Agent": UA } }).then((r) => {
    if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
    return r.text();
  });
  const $ = cheerio.load(html);

  // "Last Update 2026-06-24 18:10 (GMT+8)" → 取日期
  const m = html.match(/Last Update\s+(\d{4}-\d{2}-\d{2})/);
  const date = m ? m[1] : new Date().toISOString().slice(0, 10);
  const scraped_at = new Date().toISOString();

  const rows: Row[] = [];
  // 第一个 .price-table 即现货表（Item | Daily High | Daily Low | Session High/Low/Avg | Change）
  $("table.price-table").first().find("tbody tr").each((_, tr) => {
    const $tr = $(tr);
    const nameEl = $tr.find("span[data-toggle='tooltip']").first();
    const item = nameEl.text().trim();
    const nums = $tr.find("td.lcd-num-l").map((_, td) => $(td).text().trim()).get();
    if (!item || nums.length < 5) return; // 跳过表头/异常行

    const pctCell = $tr.find("td.percent-cell").first();
    rows.push({
      date,
      category,
      item,
      vendors: nameEl.attr("title") ?? "",
      daily_high: num(nums[0]),
      daily_low: num(nums[1]),
      session_high: num(nums[2]),
      session_low: num(nums[3]),
      session_avg: num(nums[4]),
      change_pct: pctCell.text().trim().replace(/\s+/g, ""),
      trend: pctCell.find("span").first().attr("class") ?? "", // rise-/flat-/fall-trend
      scraped_at,
    });
  });
  return rows;
}

const sqlStr = (s: string | null) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const sqlNum = (n: number | null) => (n == null ? "NULL" : String(n));

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const local = args.includes("--local");

  const all: Row[] = [];
  for (const s of SOURCES) {
    try {
      const rows = await scrapeOne(s.url, s.category);
      console.log(`✓ ${s.category.padEnd(4)} ${rows.length} 行 @ ${rows[0]?.date ?? "?"}`);
      all.push(...rows);
    } catch (e) {
      console.error(`✗ ${s.category}: ${(e as Error).message}`);
    }
  }

  if (!all.length) {
    console.error("没抓到任何数据 —— 页面可能改版，检查 scrapeOne 的 selector");
    process.exit(1);
  }

  if (dry) {
    console.table(all.map((r) => ({ cat: r.category, item: r.item, avg: r.session_avg, chg: r.change_pct })));
    console.log(`\n[--dry] 共 ${all.length} 行，未写库`);
    return;
  }

  const values = all
    .map((r) =>
      `(${sqlStr(r.date)},${sqlStr(r.category)},${sqlStr(r.item)},${sqlStr(r.vendors)},` +
      `${sqlNum(r.daily_high)},${sqlNum(r.daily_low)},${sqlNum(r.session_high)},${sqlNum(r.session_low)},${sqlNum(r.session_avg)},` +
      `${sqlStr(r.change_pct)},${sqlStr(r.trend)},${sqlStr(r.scraped_at)})`
    )
    .join(",\n");
  const sql =
    "INSERT OR REPLACE INTO spot_prices\n" +
    "(date,category,item,vendors,daily_high,daily_low,session_high,session_low,session_avg,change_pct,trend,scraped_at)\n" +
    `VALUES\n${values};`;

  const file = "/tmp/spot_insert.sql";
  writeFileSync(file, sql);
  console.log(`写入 ${all.length} 行 → D1 (${local ? "本地" : "远端"})…`);
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "storage-cycle-prices", local ? "--local" : "--remote", "--yes", "--file", file],
    { stdio: "inherit" }
  );
  console.log("✅ 完成");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

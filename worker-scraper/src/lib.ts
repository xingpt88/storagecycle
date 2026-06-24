/**
 * 现货价解析（本地脚本与 cron Worker 共用）
 * 数据来自 TrendForce 公开现货页（server-rendered HTML），仅供研究参考。
 */
import * as cheerio from "cheerio";

export const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

export const SOURCES = [
  { url: "https://www.trendforce.com/price/dram/dram_spot", category: "dram" },
  { url: "https://www.trendforce.com/price/flash/wafer_spot", category: "nand" },
] as const;

export interface Row {
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

/** 解析一个现货页 HTML → 行数组（要改 parsing 就改这里）。*/
export function parseSpot(html: string, category: string): Row[] {
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

/** 抓取所有来源并解析（共用，单源失败不影响其他源）。*/
export async function scrapeAll(): Promise<Row[]> {
  const all: Row[] = [];
  for (const s of SOURCES) {
    try {
      const html = await fetch(s.url, { headers: { "User-Agent": UA } }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });
      const rows = parseSpot(html, s.category);
      console.log(`✓ ${s.category}: ${rows.length} 行`);
      all.push(...rows);
    } catch (e) {
      console.error(`✗ ${s.category} (${s.url}):`, (e as Error).message);
    }
  }
  return all;
}

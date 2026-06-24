# StorageCycle · 存储周期监控终端

存储（DRAM / NAND / HBM）行业与企业监控仪表板。把一篇行业研究文章变成一个**带实时数据**的深色监控终端 —— 追踪存储上行周期位置、七支龙头的股价 / 财报 / 分析师共识、现货价走势，以及关键事件。

🔗 **Live:** https://storage-cycle.pages.dev

---

## 仓库结构（monorepo）

```
frontend/        Astro 站点 + Pages Functions（部署到 Cloudflare Pages）
worker-scraper/  cron Worker：每日爬 TrendForce 现货价写入 D1（含本地手动脚本）
db/              D1 schema 与说明
```

每个子目录自包含（各自 package.json）。根目录只放总览与 db schema。

## 数据流

```
Yahoo Finance ─┐                          ┌─ /api/quotes 股价/涨跌/YTD
               ├→ frontend Pages Functions ┼─ /api/history 走势对比
               ┘  （读取 / 代理）          ├─ /api/fundamentals 财报/共识/估值
                                           └─ /api/spot 读 D1 现货价
TrendForce 公开现货页 → worker-scraper(cron 每日) → D1(storage-cycle-prices)
```

- **实时（Yahoo，每次访问）**：股价、当日涨跌、YTD、最新财报（季营收/净利率/财报日）、分析师共识（目标价/区间/评级）、TTM 财务、市值/远期 P/E/52 周位置。
- **每日（自有爬虫 → D1）**：DRAM/NAND 现货均价 + 历史走势。
- **静态研报快照（截至 2026-05-19）**：合约价、TrendForce 预测、HBM 市场、产业链产值、四大拐点、投行个别目标价、监控信号 —— 均为付费研究，无免费实时源。

## 技术栈

Astro 7（静态 + 岛屿）· Tailwind v4 · TradingView lightweight-charts v5 · Cloudflare Pages / Workers / D1 · 字体 Archivo / IBM Plex Mono / Inter。

## 本地开发 / 部署

**前端（站点 + API）**
```bash
cd frontend
npm install
npm run dev                 # 仅静态（API 不跑）
# 连同 Functions 一起跑：npm run build && npx wrangler pages dev
npm run build && npx wrangler pages deploy    # 部署到 Cloudflare Pages
```

**现货价爬虫（cron Worker）**
```bash
cd worker-scraper
npm install
npm run scrape -- --dry     # 本地只解析、不写库（调 parsing 用）
npm run scrape              # 本地手动爬 → 写远端 D1
npm run deploy              # 部署 Worker（cron 每日 02:00 UTC 自动跑）
# 手动触发线上 Worker：curl https://storage-cycle-scraper.<sub>.workers.dev/run
```

## 免责声明

仅供研究与展示参考，**非投资建议**。市场数据来自 Yahoo Finance 非官方接口；现货价经爬虫取自 TrendForce 公开现货页 —— 均可能有口径异常或延迟，请以官方为准。

---

🤖 与 [Claude Code](https://claude.com/claude-code) 协作开发。

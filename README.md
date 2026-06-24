# StorageCycle · 存储周期监控终端

存储（DRAM / NAND / HBM）行业与企业监控仪表板。把一篇行业研究文章变成一个**带实时数据**的深色监控终端 —— 追踪存储上行周期位置、七支龙头的股价 / 财报 / 分析师共识，以及关键事件。

🔗 **Live:** https://storage-cycle.pages.dev

---

## 功能

- **周期热度弧**（hero 签名元素）：把"上行周期约 65%、未到顶点"画成单色琥珀仪表。
- **龙头企业 master-detail**：左侧 watchlist（含实时当日涨跌），右侧单家完整卡片，点击切换。7 支：SK海力士、美光、三星电子、闪迪、铠侠、西部数据、希捷（US / KR / JP）。
- **YTD 走势对比图**：TradingView Lightweight Charts，7 支股票全部 rebase 成 YTD% 叠加，图例可点击开关 + 悬停联动。
- **实时数据**（经 Cloudflare Pages Functions 代理 Yahoo Finance）：
  - 股价 / 当日涨跌 / YTD
  - 最新财报：报告季度末、当季营收、净利率、下次/上次财报日期
  - 分析师共识：目标价 / 区间 / 分析师数 / 评级、TTM 营收 / 毛利率 / 营业利润率
- **行业指标**：四大拐点、合约价、供需基本面、技术路线、TrendForce 判断、HBM 市场、产业链产值、现货价、事件日历（均为文章研报快照）。

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | [Astro](https://astro.build) 7（静态输出，岛屿架构） |
| 样式 | Tailwind CSS v4（`@theme` 设计 token） |
| 图表 | [lightweight-charts](https://github.com/tradingview/lightweight-charts) v5（React island） |
| 后端 | Cloudflare Pages Functions（`functions/api/*`） |
| 部署 | Cloudflare Pages（纯静态 + Functions） |
| 字体 | Archivo（标题）/ IBM Plex Mono（数据）/ Inter（正文） |

页面绝大部分是零 JS 的静态 Astro；只有走势图（React island）和报价/财报填充（一小段原生脚本）在客户端运行。

## 数据来源：实时 vs 静态

| 数据 | 来源 | 更新 |
|------|------|------|
| 股价、涨跌、YTD、财报、分析师共识、TTM 财务 | Yahoo Finance（边缘代理，免密钥） | **每次访问实时** |
| 合约价、TrendForce 预测、HBM 市场、现货价、四大拐点、投行个别目标价、监控信号文字 | 行业研报（TrendForce / DRAMeXchange / 投行）| 人工维护，截至 2026-05-19 |

> 合约价 / 现货价等是付费研究，无免费实时源，故保持静态快照并明确标注。

## API（Cloudflare Pages Functions）

| 端点 | 说明 |
|------|------|
| `GET /api/quotes?symbols=MU,000660.KS,…` | 实时报价（价格 / 当日涨跌 / YTD） |
| `GET /api/history?symbols=…` | YTD 日线序列 + 去年收盘基准（走势图用） |
| `GET /api/fundamentals?symbols=…` | 分析师共识 + TTM 财务 + 最新财报 + 财报日期 |

Yahoo 的 `quoteSummary` 需要 crumb 握手（先取 cookie，再取 crumb，再带上调用），已在 `functions/api/fundamentals.js` 实现，并在 Cloudflare Workers 运行时验证可用。响应带边缘缓存（60–300s）。

## 本地开发

```bash
npm install
npm run dev          # http://localhost:4321（仅静态，API 不会跑）
```

要本地连同 Functions 一起跑（测试 /api/*）：

```bash
npm run build
npx wrangler pages dev dist
```

## 部署（Cloudflare Pages）

```bash
npm run build
npx wrangler pages deploy dist --project-name storage-cycle --branch main
```

`functions/` 目录会被 wrangler 自动编译为 Pages Functions 一并部署。

## 项目结构

```
src/
  data/metrics.ts          # 所有数据（静态研报 + 公司元信息）
  components/
    CycleArc.astro         # 周期热度弧（手写 SVG）
    Sidebar.astro          # 固定侧栏 + 章节导航
    CompanyCard.astro      # 公司卡片（双栏：财务 | 监控信号）
    Table.astro / Section.astro / InflectionCard.astro / DataTable…
    react/PriceChart.tsx   # YTD 走势对比图（lightweight-charts island）
  pages/index.astro        # 主页 + 客户端实时数据脚本
  styles/global.css        # 设计 token + 动画
functions/api/
  quotes.js  history.js  fundamentals.js   # Yahoo 代理
public/logos/              # 公司 / 数据源 logo（构建前下载并提交）
```

## 公司 / 数据源 logo

`public/logos/` 下的 logo 用 [logo.dev](https://logo.dev) 一次性下载为 PNG 提交进仓库（WD 因 logo.dev 返回有误，改用官网 favicon）。**logo.dev token 不在仓库内**，运行/部署都不需要它。

## 免责声明

仅供研究与展示参考，**非投资建议**。市场数据来自 Yahoo Finance 非官方接口，偶有口径异常（例如个别公司单季口径），请以官方财报为准。

---

🤖 与 [Claude Code](https://claude.com/claude-code) 协作开发。

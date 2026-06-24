# D1 · 现货价数据库

存储现货报价（DRAM/NAND）的时间序列。爬虫（`worker-scraper`）写入，前端 `/api/spot` 读取。

| | |
|---|---|
| 数据库 | `storage-cycle-prices`（Cloudflare D1，APAC） |
| database_id | `53a2c9c7-82bf-4b60-848f-8e1d52cdfcb4` |
| 绑定名 | `DB`（frontend Pages Functions 与 worker-scraper 都绑这个） |
| 表 | `spot_prices`（见 `schema.sql`，主键 `date+item`，重抓同日 UPSERT） |

## 初始化 / 改表

```bash
npx wrangler d1 execute storage-cycle-prices --remote --file=db/schema.sql
```

## 谁读谁写

- **写**：`worker-scraper`（cron 每日 02:00 UTC）爬 TrendForce 公开现货页 → `INSERT OR REPLACE`。
- **读**：`frontend/functions/api/spot.js`
  - `GET /api/spot` → 每个品项各自最新一条
  - `GET /api/spot?item=<item>` → 该品项最近 180 天历史（走势图用）

## 历史回填说明

TrendForce 历史走势是会员墙（公开页只有当天），无法直爬。DDR4 16Gb (2Gx8) 3200 的历史
（2026-02-07 起 126 天）一次性回填自公开社区数据集
[titled-agent-001/ddr4-pricing-log](https://github.com/titled-agent-001/ddr4-pricing-log)。
其余品项的历史由 cron 每日累积。回填属一次性手动操作，非自动流程。

## 常用查询

```bash
# 看最新快照
npx wrangler d1 execute storage-cycle-prices --remote \
  --command "SELECT date,category,item,session_avg,change_pct FROM spot_prices WHERE date=(SELECT MAX(date) FROM spot_prices)"

# 某品项历史条数
npx wrangler d1 execute storage-cycle-prices --remote \
  --command "SELECT item,COUNT(*) FROM spot_prices GROUP BY item"
```

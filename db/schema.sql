-- 存储现货报价（爬自 TrendForce 公开现货页）
-- 时间序列：每天每个品项一行；重复抓同一天会 UPSERT。
CREATE TABLE IF NOT EXISTS spot_prices (
  date          TEXT NOT NULL,            -- YYYY-MM-DD（Last Update 当天）
  category      TEXT NOT NULL,            -- 'dram' | 'nand'
  item          TEXT NOT NULL,            -- 例：DDR5 16Gb (2Gx8) 4800/5600
  vendors       TEXT,                     -- 例：SK Hynix、Samsung
  daily_high    REAL,
  daily_low     REAL,
  session_high  REAL,
  session_low   REAL,
  session_avg   REAL,
  change_pct    TEXT,                     -- 原样保留，如 "▲0.36%"
  trend         TEXT,                     -- rise-trend | flat-trend | fall-trend
  scraped_at    TEXT NOT NULL,            -- ISO 时间戳
  PRIMARY KEY (date, item)
);

CREATE INDEX IF NOT EXISTS idx_spot_item_date ON spot_prices (item, date);
CREATE INDEX IF NOT EXISTS idx_spot_cat_date  ON spot_prices (category, date);

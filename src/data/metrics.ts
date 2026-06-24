// 存储行业与企业监控指标体系
// 最后更新：2026年5月19日
// 数据来源：TrendForce、花旗、JPMorgan、各公司财报、DRAMeXchange、Yahoo Finance

export interface Source {
  name: string;
  logo?: string; // /logos/src-*.png；无则用通用图标
}

export const sources: Source[] = [
  { name: "TrendForce", logo: "/logos/src-trendforce.png" },
  { name: "花旗", logo: "/logos/src-citi.png" },
  { name: "JPMorgan", logo: "/logos/src-jpmorgan.png" },
  { name: "各公司财报" }, // 非品牌，用通用图标
  { name: "DRAMeXchange", logo: "/logos/src-dramexchange.png" },
  { name: "Yahoo Finance", logo: "/logos/src-yahoo.png" },
];

export const META = {
  title: "存储行业与企业监控指标体系",
  updated: "2026年5月19日",
  sources,
  cycleSummary:
    "上行周期中段（约 60–70% 位置），四个拐点指标均指向「周期未到顶点」。",
};

// ── 一、四大拐点指标 ──────────────────────────────
export type Turn = "上行中段" | "战略性低位" | "历史最高";
export interface InflectionMetric {
  id: number;
  name: string;
  current: string;
  stage: Turn;
  topSignal: string;
  frequency: string;
  trend: string; // 变化趋势
}

export const inflectionMetrics: InflectionMetric[] = [
  {
    id: 1,
    name: "产能利用率",
    current: "95–98%",
    stage: "上行中段",
    topSignal: "<90%",
    frequency: "季度",
    trend: "→ 满载运行",
  },
  {
    id: 2,
    name: "合约价格 QoQ 涨幅",
    current: "DRAM +58~63%，NAND +70~75%",
    stage: "上行中段",
    topSignal: "连续两季 <10%",
    frequency: "月度",
    trend: "↓ 斜率（涨幅仍强但放缓）",
  },
  {
    id: 3,
    name: "库存周转天数",
    current: "94–131 天",
    stage: "战略性低位",
    topSignal: ">180 天",
    frequency: "季度",
    trend: "→ 低位稳定",
  },
  {
    id: 4,
    name: "长协锁单占比",
    current: ">50%",
    stage: "历史最高",
    topSignal: "大幅下降",
    frequency: "季度",
    trend: "↑ 持续增长",
  },
];

// ── 二、价格监控 ──────────────────────────────────
export interface PriceMonitor {
  product: string;
  source: string;
  status: string;
  next: string;
}

export const priceMonitors: PriceMonitor[] = [
  { product: "DRAM 合约价", source: "TrendForce", status: "QoQ +58~63%", next: "每月初" },
  { product: "NAND 合约价", source: "TrendForce", status: "QoQ +70~75%", next: "每月初" },
  { product: "DDR5 Server DRAM", source: "TrendForce", status: "QoQ >60%", next: "每月初" },
  { product: "eSSD 合约价", source: "TrendForce", status: "QoQ +40%+", next: "每月初" },
  { product: "HBM3E 价格", source: "花旗 / SK海力士", status: "$12–15/GB", next: "季度" },
  { product: "HBM4 价格", source: "JPM / 三星", status: "$15–20/GB", next: "季度" },
  { product: "DRAM 现货价", source: "DRAMeXchange", status: "4月高点后小幅回调", next: "每日" },
  { product: "NAND 现货价", source: "DRAMeXchange", status: "回调 5–10%", next: "每日" },
];

// ── 三、供需基本面 ────────────────────────────────
export interface Fundamental {
  metric: string;
  source: string;
  current: string;
  normal: string;
}

export const fundamentals: Fundamental[] = [
  { metric: "全球 DRAM bit 增长", source: "TrendForce", current: "+15–18% YoY", normal: "15–20%" },
  { metric: "全球 NAND bit 增长", source: "TrendForce", current: "+12–15% YoY", normal: "25–35%" },
  { metric: "HBM bit 增长", source: "花旗 / Yole", current: "高速增长", normal: "50–100%" },
  { metric: "CSP capex 增速", source: "各公司财报", current: "+40–50% YoY", normal: "10–20%" },
  { metric: "AI 服务器出货量", source: "TrendForce / IDC", current: "+35–40% YoY", normal: "10–15%" },
  { metric: "晶圆代工产能", source: "台积电 / 三星", current: "3nm/5nm 满载", normal: "—" },
];

// ── 四、技术路线监控 ──────────────────────────────
export interface TechRoadmap {
  tech: string;
  leader: string;
  milestone: string;
  timeline: string;
}

export const techRoadmap: TechRoadmap[] = [
  { tech: "HBM4 12H 量产", leader: "SK海力士", milestone: "Rubin 平台出货", timeline: "2026 Q1 已实现" },
  { tech: "HBM4 16H 送样", leader: "SK海力士", milestone: "样品验证", timeline: "2026 Q2 进行中" },
  { tech: "HBM4E 开发", leader: "三星（混合键合）", milestone: "客户样品", timeline: "2026 H2" },
  { tech: "1-gamma 节点", leader: "美光 / SK海力士", milestone: "良率爬坡", timeline: "2026–2027" },
  { tech: "SoCAMM2", leader: "SK海力士", milestone: "NVIDIA 认证", timeline: "2026 H2 放量" },
  { tech: "HBF 商业化", leader: "闪迪", milestone: "客户送样", timeline: "2028 年目标" },
  { tech: "混合键合 HBM", leader: "三星", milestone: "技术验证", timeline: "2027–2028" },
];

// ── 五、企业级监控指标 ────────────────────────────
export interface CompanyMetric {
  id: number;
  name: string;
  signal: string;
  status: string;
}

export interface TargetPrice {
  bank: string;
  target: string;
  rating: string;
  date: string;
}

export interface Earnings {
  period: string;
  revenue: string;
  opIncome: string;
  margin: string;
  highlight: string;
}

export interface Company {
  name: string;
  ticker: string;
  region: string;
  focus: string[];
  prevClose: string;
  last: string;
  dayChange: string; // negative string
  ytd: string;
  yf: string[]; // Yahoo Finance 代号，用于实时报价
  logos: string[]; // 官方 logo（站点 favicon）路径，位于 /public/logos
  metrics: CompanyMetric[];
  earnings?: Earnings;
  targets: TargetPrice[];
}

export const companies: Company[] = [
  {
    name: "SK海力士",
    ticker: "000660.KS",
    region: "韩国",
    focus: ["HBM 龙头", "DRAM", "NAND"],
    prevClose: "₩1,840,000",
    last: "₩1,745,000",
    dayChange: "-5.16%",
    ytd: "+129%+",
    yf: ["000660.KS"],
    logos: ["/logos/skhynix.png"],
    metrics: [
      { id: 1, name: "HBM4 份额与认证进度", signal: "NVIDIA Rubin 平台出货数据、客户反馈", status: "Rubin 首批认证，份额 ~60–70%" },
      { id: 2, name: "LTA 条款质量", signal: "预付款/财务担保、价格机制、覆盖产品", status: "客户锁量意愿强，条款不透明" },
      { id: 3, name: "传统 DRAM 合约价走势", signal: "服务器 DRAM 合约价、云厂商采购节奏", status: "逐季大幅上涨" },
      { id: 4, name: "NAND/eSSD 需求持续性", signal: "高容量 QLC eSSD 份额、数据中心客户粘性", status: "NAND ASP 同比 +217%" },
      { id: 5, name: "资本开支纪律", signal: "M15X/Y1 进度、HBM 占比、NAND 扩产决策", status: "优先扩 HBM/DRAM" },
      { id: 6, name: "股东回报兑现", signal: "ADR/回购/注销/分红的实际执行", status: "净现金 35 万亿韩元" },
    ],
    earnings: { period: "2026 Q1", revenue: "₩52.3 万亿", opIncome: "₩37.6 万亿", margin: "72%", highlight: "HBM 收入 >30%，OP Margin 72%" },
    targets: [
      { bank: "花旗", target: "₩3,100,000", rating: "买入", date: "5月11日" },
      { bank: "高盛", target: "₩1,350,000", rating: "买入", date: "4月30日" },
      { bank: "SK证券", target: "₩3,000,000", rating: "买入", date: "5月7日" },
    ],
  },
  {
    name: "美光",
    ticker: "MU",
    region: "美国",
    focus: ["DRAM", "NAND", "HBM3E"],
    prevClose: "$681.55",
    last: "$661.45",
    dayChange: "-2.95%",
    ytd: "+125%+",
    yf: ["MU"],
    logos: ["/logos/micron.png"],
    metrics: [
      { id: 1, name: "HBM4 12H 放量进度", signal: "FQ3/FQ4 财报 HBM 收入占比", status: "已量产，开始爬坡" },
      { id: 2, name: "服务器 DRAM 合约价走势", signal: "季度 ASP 环比", status: "逐季大幅上涨" },
      { id: 3, name: "SCA 硬证据", signal: "财报电话会披露", status: "FQ2 已有初步披露" },
      { id: 4, name: "数据中心 NAND 增长持续性", signal: "FQ3 数据中心收入", status: "FQ2 收入翻倍" },
      { id: 5, name: "capex 与 FCF 平衡", signal: "资本开支计划和自由现金流", status: "FY26 超 $25B，仍正 FCF" },
      { id: 6, name: "FQ3 毛利率 81% 兑现", signal: "FQ3 实际财报", status: "指引已给出，5月底验证" },
    ],
    earnings: { period: "FQ2 FY26", revenue: "$23.86B", opIncome: "—", margin: "75%（Non-GAAP）", highlight: "DRAM +207% YoY，FQ3 指引 $33.5B" },
    targets: [
      { bank: "花旗", target: "$840", rating: "买入", date: "5月18日" },
      { bank: "Mizuho", target: "$800（↑$740）", rating: "跑赢大盘", date: "5月19日" },
      { bank: "DA Davidson", target: "$1,000", rating: "买入", date: "4月28日" },
      { bank: "TD Cowen", target: "$660（↑$550）", rating: "—", date: "5月" },
      { bank: "摩根士丹利", target: "$520", rating: "增持", date: "4月28日" },
    ],
  },
  {
    name: "三星电子",
    ticker: "005930.KS",
    region: "韩国",
    focus: ["DRAM", "NAND", "HBM4", "代工"],
    prevClose: "₩281,000",
    last: "₩275,500",
    dayChange: "-1.96%",
    ytd: "+29.8%",
    yf: ["005930.KS"],
    logos: ["/logos/samsung.png"],
    metrics: [
      { id: 1, name: "HBM4 Rubin 份额", signal: "客户反馈和出货数据", status: "~20–25%，目标 30%+" },
      { id: 2, name: "劳资协议（罢工风险解除）", signal: "工会投票结果", status: "5/27 工会 73.7% 通过；半导体 OP 10.5% 入奖金池，罢工取消" },
      { id: 3, name: "LTA 条款兑现", signal: "财报电话会披露", status: "已签署多年期协议" },
      { id: 4, name: "平泽 P4/P5 产能爬坡", signal: "资本开支进度", status: "2026 年 capex ₩110 万亿" },
      { id: 5, name: "MX 利润率恢复", signal: "手机 ASP 和利润率", status: "OPM 降至 5%" },
      { id: 6, name: "股东回报计划", signal: "特别股息/回购公告", status: "超过 ₩110 万亿可用" },
    ],
    earnings: { period: "2026 Q1", revenue: "₩79.1 万亿", opIncome: "₩57.2 万亿（DS）", margin: "65.7%（DS）", highlight: "HBM4 量产，传统 DRAM 利润率 >HBM" },
    targets: [
      { bank: "JPMorgan", target: "₩350,000", rating: "增持", date: "4月30日" },
      { bank: "SK证券", target: "₩500,000", rating: "买入", date: "5月7日" },
    ],
  },
  {
    name: "闪迪",
    ticker: "SNDK",
    region: "美国",
    focus: ["NAND", "eSSD", "HBF"],
    prevClose: "$1,333.01",
    last: "$1,317.79",
    dayChange: "-1.14%",
    ytd: "+250%+",
    yf: ["SNDK"],
    logos: ["/logos/sandisk.png"],
    metrics: [
      { id: 1, name: "NBM 协议条款质量", signal: "预付款/担保/违约条款", status: "累计 5 份，RPO $420 亿" },
      { id: 2, name: "NAND 合约价走势", signal: "季度 ASP 和利润率", status: "QoQ +70–75%" },
      { id: 3, name: "HBF 客户验证进度", signal: "送样反馈和认证时间", status: "客户送样阶段" },
      { id: 4, name: "数据中心 NAND 增长", signal: "数据中心收入占比", status: "占比从 14% 跃至 25%" },
      { id: 5, name: "capex 纪律", signal: "FY27 资本开支计划", status: "优先扩 eSSD" },
      { id: 6, name: "毛利率 70% 可持续性", signal: "季度毛利率走势", status: "3Q26 69.5%，4Q 指引 >70%" },
    ],
    earnings: { period: "3Q FY26", revenue: "$31.8B", opIncome: "—", margin: "69.5%（Non-GAAP）", highlight: "数据中心 NAND +233% QoQ" },
    targets: [
      { bank: "高盛", target: "$1,025", rating: "买入", date: "5月2日" },
      { bank: "花旗", target: "$1,085", rating: "买入", date: "5月15日" },
      { bank: "Singular Research", target: "$2,590", rating: "买入（新覆盖）", date: "5月" },
    ],
  },
  {
    name: "铠侠",
    ticker: "285A.T",
    region: "日本",
    focus: ["NAND", "eSSD", "BiCS FLASH"],
    prevClose: "¥51,450",
    last: "¥49,770",
    dayChange: "-3.27%",
    ytd: "+277%",
    yf: ["285A.T"],
    logos: ["/logos/kioxia.png"],
    metrics: [
      { id: 1, name: "NAND 合约价走势", signal: "季度 ASP", status: "QoQ +70–75%" },
      { id: 2, name: "Flash Ventures 合资稳定性", signal: "与闪迪的合作公告", status: "协议延至 2034 年" },
      { id: 3, name: "eSSD 收入占比", signal: "产品结构变化", status: "~25% 目标 45%（FY27）" },
      { id: 4, name: "BiCS FLASH 技术领先性", signal: "层数追赶和良率", status: "8 代 218 层" },
      { id: 5, name: "OP Margin 可持续性", signal: "季度利润率", status: "Q4 59.5% → Q1 74.2%" },
      { id: 6, name: "HBM 晶圆供应（给闪迪）", signal: "HBF 相关订单", status: "潜在长期期权" },
    ],
    earnings: { period: "FY26 Q4", revenue: "¥1.003 万亿", opIncome: "¥5,968 亿", margin: "59.5%", highlight: "FY27 Q1 指引 ¥1.75 万亿" },
    targets: [{ bank: "花旗", target: "¥73,000", rating: "买入（高风险）", date: "5月17日" }],
  },
  {
    name: "西部数据",
    ticker: "WDC",
    region: "美国",
    focus: ["HDD", "ePMR", "HAMR"],
    prevClose: "$458.68",
    last: "~$445",
    dayChange: "-3.04%",
    ytd: "+80%+",
    yf: ["WDC"],
    logos: ["/logos/wdc.png"],
    metrics: [
      { id: 1, name: "AI 数据湖需求增速", signal: "Exabyte 需求增长", status: "CAGR 从 15% 上调至 25%+" },
      { id: 2, name: "ePMR/UltraSMR/HAMR 路线", signal: "容量提升和良率", status: "向 HAMR 过渡，UltraSMR 放量" },
      { id: 3, name: "LTA 续约情况", signal: "合同期限和客户数量", status: "延至 2027–28" },
      { id: 4, name: "产能利用率", signal: "生产周期和 BTO 锁定", status: "BTO 4–5 季度锁定" },
      { id: 5, name: "HDD 平均容量提升", signal: "每盘 TB 数和 ASP", status: "30TB → 40TB → 50TB" },
      { id: 6, name: "FCF 和股东回报", signal: "股息和回购", status: "稳定现金流生成" },
    ],
    targets: [{ bank: "JPMorgan", target: "$230", rating: "买入", date: "1月" }],
  },
  {
    name: "希捷",
    ticker: "STX",
    region: "美国",
    focus: ["HDD", "HAMR", "Mozaic"],
    prevClose: "$740.84",
    last: "~$720",
    dayChange: "-2.80%",
    ytd: "+100%+",
    yf: ["STX"],
    logos: ["/logos/seagate.png"],
    metrics: [
      { id: 1, name: "AI 数据湖需求增速", signal: "Exabyte 需求增长", status: "CAGR 从 15% 上调至 25%+" },
      { id: 2, name: "Mozaic/HAMR 量产", signal: "容量提升和良率", status: "Mozaic 3TB+/platter 出货领先" },
      { id: 3, name: "LTA 续约情况", signal: "合同期限和客户数量", status: "延至 2028–29" },
      { id: 4, name: "产能利用率", signal: "生产周期和 BTO 锁定", status: "BTO 4–5 季度锁定" },
      { id: 5, name: "HDD 平均容量提升", signal: "每盘 TB 数和 ASP", status: "30TB → 40TB → 50TB" },
      { id: 6, name: "FCF 和股东回报", signal: "股息和回购", status: "稳定现金流生成" },
    ],
    targets: [{ bank: "JPMorgan", target: "$260", rating: "买入", date: "1月" }],
  },
];

// ── 六、关键事件日历 ──────────────────────────────
export interface CalendarEvent {
  time: string;
  event: string;
  tickers: string;
  importance: number; // 1-5
}

export const calendar: CalendarEvent[] = [
  { time: "5月底", event: "美光 FQ3 FY26 财报（毛利率 81% 验证）", tickers: "MU", importance: 5 },
  { time: "7月", event: "SK海力士 Q2 FY26 财报", tickers: "000660.KS", importance: 5 },
  { time: "7月", event: "铠侠 FY27 Q1 财报（OP Margin 74% 验证）", tickers: "285A.T", importance: 4 },
  { time: "8月", event: "美光 FQ4 FY26 财报（全年业绩）", tickers: "MU", importance: 4 },
  { time: "Q3", event: "合约价格 Q3 涨幅（是否放缓）", tickers: "全行业", importance: 4 },
  { time: "H2 2026", event: "HBM4 16H 量产进度", tickers: "SK海力士, 三星, MU", importance: 4 },
  { time: "2027年", event: "新增产能建设计划（是否过度扩张）", tickers: "全行业", importance: 3 },
  { time: "持续", event: "LTA 条款兑现（SCA/NBM 硬证据）", tickers: "MU, SNDK, 三星", importance: 5 },
  { time: "每月初", event: "TrendForce 合约价格更新", tickers: "全行业", importance: 4 },
  { time: "每周", event: "DRAM/NAND 现货价格追踪", tickers: "全行业", importance: 3 },
];

// ── 七、TrendForce 合约价格预测 ──────────────────
export interface ContractPrice {
  quarter: string;
  qoq: string;
  yoy: string;
  driver: string;
}

export const dramContract: ContractPrice[] = [
  { quarter: "2025 Q4", qoq: "+18~23%（上修后）", yoy: "—", driver: "CSP 加单、DDR5 需求" },
  { quarter: "2026 Q1", qoq: "+90~95%（上修后）", yoy: "—", driver: "AI 服务器需求、产能转向 HBM" },
  { quarter: "2026 Q2", qoq: "+58~63%", yoy: "~+186%", driver: "服务器 DRAM、RDIMM 焦点" },
  { quarter: "2026 Q3（E）", qoq: "+30~40%（预计）", yoy: "—", driver: "涨幅斜率放缓但仍强劲" },
  { quarter: "2026 Q4（E）", qoq: "+15~25%（预计）", yoy: "—", driver: "旺季效应" },
];

export const nandContract: ContractPrice[] = [
  { quarter: "2025 Q4", qoq: "+18~23%", yoy: "—", driver: "减产去库存、AI 投资" },
  { quarter: "2026 Q1", qoq: "+55~60%（上修后）", yoy: "—", driver: "产能管控、Server 拉货" },
  { quarter: "2026 Q2", qoq: "+70~75%", yoy: "~+217%", driver: "eSSD 需求爆发、新增产能 2028 年才释放" },
  { quarter: "2026 Q3（E）", qoq: "+40~50%（预计）", yoy: "—", driver: "企业级客户优先" },
  { quarter: "2026 Q4（E）", qoq: "+20~30%（预计）", yoy: "—", driver: "供给持续紧张" },
];

export const trendForceJudgments: string[] = [
  "2026 年存储产业产值：$5,516 亿美元，2027 年预计达 $8,427 亿美元（+53% YoY）",
  "合约价涨势延续至 2027 年：AI 基础设施需求长期支撑",
  "新增产能 2027 年底或 2028 年才能大规模释放：供应紧张态势持续",
  "eMMC/UFS 供给缺口位于全产品线之冠：移动端最受挤压",
  "DDR5 获利 2026 Q1 起优于 HBM3e：DRAM 利润率首次超过 HBM",
];

// ── 八、HBM 市场数据 ──────────────────────────────
export interface HbmDatum {
  dimension: string;
  value: string;
  source: string;
}

export const hbmMarket: HbmDatum[] = [
  { dimension: "2025 年 HBM 市场规模", value: "~$18B", source: "Yole Group" },
  { dimension: "2026 年 HBM 市场规模（E）", value: "~$45–50B", source: "花旗 / JPM" },
  { dimension: "2027 年 HBM 市场规模（E）", value: "~$80–100B", source: "花旗" },
  { dimension: "2030 年 HBM 市场规模（E）", value: "~$150B+", source: "Yole Group" },
  { dimension: "HBM 占 DRAM 总产能", value: "~30%+", source: "TrendForce" },
  { dimension: "HBM3E 价格", value: "$12–15/GB", source: "行业估计" },
  { dimension: "HBM4 价格（E）", value: "$15–20/GB", source: "花旗 / JPM" },
  { dimension: "HBM4 12H 量产状态", value: "三家均已量产", source: "各公司财报" },
  { dimension: "HBM4 16H 送样状态", value: "SK海力士领先", source: "产业链报告" },
];

// ── 九、产业链产值预测 ────────────────────────────
export interface IndustryValue {
  year: string;
  total: string;
  dram: string;
  nand: string;
  hbm: string;
  growth: string;
}

export const industryValue: IndustryValue[] = [
  { year: "2024", total: "~$165", dram: "~$120", nand: "~$45", hbm: "~$8", growth: "—" },
  { year: "2025", total: "~$300", dram: "~$220", nand: "~$80", hbm: "~$18", growth: "+82%" },
  { year: "2026（E）", total: "$551.6", dram: "~$400", nand: "~$120", hbm: "~$45–50", growth: "+84%" },
  { year: "2027（E）", total: "$842.7", dram: "~$550", nand: "~$180", hbm: "~$80–100", growth: "+53%" },
];

// ── 十、现货价格走势（5月19日当周）──────────────
export interface SpotPrice {
  product: string;
  aprHigh: string;
  may12: string;
  may19: string;
  weekChange: string;
  note: string;
}

export const spotPrices: SpotPrice[] = [
  { product: "DDR5 16Gb", aprHigh: "$8.50", may12: "$8.20", may19: "~$7.80", weekChange: "-4.9%", note: "持续回调" },
  { product: "DDR4 16Gb", aprHigh: "$5.80", may12: "$5.65", may19: "~$5.35", weekChange: "-5.3%", note: "加速回调" },
  { product: "NAND 512Gb TLC", aprHigh: "$4.20", may12: "$3.85", may19: "~$3.55", weekChange: "-7.8%", note: "回调加深" },
  { product: "NAND 256Gb TLC", aprHigh: "$3.10", may12: "$2.95", may19: "~$2.80", weekChange: "-5.1%", note: "持续走弱" },
];

export const spotNote =
  "现货价格连续第四周回调，NAND 512Gb 累计从高点回撤约 15.5%。合约价与现货价剪刀差持续扩大，反映长协锁量、现货市场流动性下降。非趋势性逆转信号——合约价格仍在强劲上涨，现货回调是前期涨幅过大后的正常技术性整理。";

// ── 十一、最新业绩（汇总，含非个股公司）──────────
export interface EarningsRow {
  company: string;
  period: string;
  revenue: string;
  opIncome: string;
  margin: string;
  highlight: string;
}

export const earningsTable: EarningsRow[] = [
  { company: "SK海力士", period: "2026 Q1", revenue: "₩52.3 万亿", opIncome: "₩37.6 万亿", margin: "72%", highlight: "HBM 收入 >30%，OP Margin 72%" },
  { company: "三星电子", period: "2026 Q1", revenue: "₩79.1 万亿", opIncome: "₩57.2 万亿（DS）", margin: "65.7%（DS）", highlight: "HBM4 量产，传统 DRAM 利润率 >HBM" },
  { company: "美光", period: "FQ2 FY26", revenue: "$23.86B", opIncome: "—", margin: "75%（Non-GAAP）", highlight: "DRAM +207% YoY，FQ3 指引 $33.5B" },
  { company: "闪迪", period: "3Q FY26", revenue: "$31.8B", opIncome: "—", margin: "69.5%（Non-GAAP）", highlight: "数据中心 NAND +233% QoQ" },
  { company: "铠侠", period: "FY26 Q4", revenue: "¥1.003 万亿", opIncome: "¥5,968 亿", margin: "59.5%", highlight: "FY27 Q1 指引 ¥1.75 万亿" },
  { company: "长鑫存储", period: "2026 Q1", revenue: "508 亿元", opIncome: "330 亿元", margin: "—", highlight: "+719% YoY，全球市占率 7.67%" },
];

// ── 十二、重大事件追踪 ────────────────────────────
// 注：三星罢工已于 5/20 达成临时协议、5/27 工会以 73.7% 投票通过（半导体 OP 10.5% 入奖金池），
// 风险解除，相关追踪内容已移除。
export const micronPreview = {
  date: "2026-06-24（Yahoo 标定下次财报）",
  checkpoint: "毛利率 81% 指引是否兑现",
  revenueGuide: "$33.5B",
  mizuho: "Mizuho 5/19 上调目标价至 $800：FY26 EPS 预测高过共识 14%，FY27 高 23%",
};

// ── 关键摘要卡片 ──────────────────────────────────
export const headlineStats = [
  { label: "2026 产业产值", value: "$5,516 亿", sub: "2027E $8,427 亿 · +53% YoY" },
  { label: "周期位置", value: "60–70%", sub: "上行周期中段 · 未到顶点" },
  { label: "DRAM 合约价 Q2", value: "+58~63%", sub: "QoQ · ~+186% YoY" },
  { label: "NAND 合约价 Q2", value: "+70~75%", sub: "QoQ · ~+217% YoY" },
];

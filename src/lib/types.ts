export type StockMove = {
  code: string;
  name: string;
  pct: number;
  price: number;
  reason?: string;
};

export type SectorMove = {
  name: string;
  pct: number;
  leaders: string[];
  reason: string;
};

export type MarketSummary = {
  indexName: string;
  /** 上证收盘点数 */
  indexClose: number;
  indexPct: number;
  limitUp: number;
  limitDown: number;
  upCount: number;
  downCount: number;
  sentiment: string;
  oneLiner: string;
};

export type DailyReport = {
  date: string;
  summary: MarketSummary;
  limitUp: StockMove[];
  limitDown: StockMove[];
  topGainers: StockMove[];
  topLosers: StockMove[];
  sectors: SectorMove[];
  interpretation: string;
};

export type PeriodStock = {
  code: string;
  name: string;
  pct7d: number;
  pct14d: number;
  sector: string;
  note: string;
};

export type PeriodReport = {
  asOf: string;
  gainers7d: PeriodStock[];
  losers7d: PeriodStock[];
  gainers14d: PeriodStock[];
  losers14d: PeriodStock[];
};

export type TradeAction = "buy" | "sell" | "hold";

export type Recommendation = {
  id: string;
  date: string;
  horizonDays: 1 | 3 | 5 | 7;
  code: string;
  name: string;
  thesis: string;
  targetNote: string;
  status: "watching" | "reviewed";
  action?: TradeAction;
};

export type TodaySellItem = {
  id: string;
  code: string;
  name: string;
  action: "sell";
  sector: string;
  entryDate: string;
  suggestDate: string;
  horizonDays: number;
  heldPct: number;
  reason: string;
};

export type PlanItem = {
  id: string;
  action: TradeAction;
  code: string;
  name: string;
  sector: string;
  suggestDate: string;
  expectedPct: number;
  thesis: string;
  note: string;
};

export type HorizonPlan = {
  horizonDays: 1 | 3 | 7;
  title: string;
  items: PlanItem[];
};

export type RecommendationsFile = {
  updatedAt: string;
  asOf: string;
  todaySell: TodaySellItem[];
  plans: HorizonPlan[];
  items: Recommendation[];
};

export type Review = {
  id: string;
  recommendationId: string;
  recommendDate: string;
  reviewDate: string;
  code: string;
  name: string;
  horizonDays: 1 | 3 | 5 | 7;
  expectedNote: string;
  /** 复盘时对照的软目标涨跌幅（%） */
  expectedPct: number;
  actualPct: number;
  gapNote: string;
  gapReason: string;
  result: "beat" | "met" | "miss";
};

export type DataIndex = {
  market: string;
  latestDate: string;
  dates: string[];
  disclaimer: string;
};

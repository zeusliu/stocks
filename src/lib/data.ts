import type {
  DailyReport,
  DataIndex,
  PeriodReport,
  RecommendationsFile,
  Review,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`加载数据失败: ${path}`);
  }
  return res.json() as T;
}

export async function getIndex(): Promise<DataIndex> {
  return fetchJson<DataIndex>("/data/index.json");
}

export async function getDaily(date: string): Promise<DailyReport> {
  return fetchJson<DailyReport>(`/data/daily/${date}.json`);
}

export async function getPeriods(): Promise<PeriodReport> {
  return fetchJson<PeriodReport>("/data/periods.json");
}

export async function getRecommendations(): Promise<RecommendationsFile> {
  return fetchJson("/data/recommendations.json");
}

export async function getReviews(): Promise<{
  updatedAt: string;
  items: Review[];
}> {
  return fetchJson("/data/reviews.json");
}

export function formatPct(pct: number, digits = 2): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

export function pctClass(pct: number): string {
  if (pct > 0) return "text-up";
  if (pct < 0) return "text-down";
  return "text-muted";
}

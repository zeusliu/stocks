import { readFile } from "fs/promises";
import path from "path";
import type {
  DailyReport,
  DataIndex,
  PeriodReport,
  RecommendationsFile,
  Review,
} from "./types";

const dataRoot = path.join(process.cwd(), "public", "data");

async function readJson<T>(relativePath: string): Promise<T> {
  const raw = await readFile(path.join(dataRoot, relativePath), "utf8");
  return JSON.parse(raw) as T;
}

export async function loadIndex(): Promise<DataIndex> {
  return readJson<DataIndex>("index.json");
}

export async function loadDaily(date: string): Promise<DailyReport> {
  return readJson<DailyReport>(`daily/${date}.json`);
}

export async function loadPeriods(): Promise<PeriodReport> {
  return readJson<PeriodReport>("periods.json");
}

export async function loadRecommendations(): Promise<RecommendationsFile> {
  return readJson("recommendations.json");
}

export async function loadReviews(): Promise<{
  updatedAt: string;
  items: Review[];
}> {
  return readJson("reviews.json");
}

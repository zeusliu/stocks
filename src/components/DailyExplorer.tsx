"use client";

import { useEffect, useState } from "react";
import type { DailyReport } from "@/lib/types";
import { formatPct, pctClass } from "@/lib/data";
import { StockTable } from "@/components/StockTable";
import { SectionTitle } from "@/components/SiteChrome";

export function DailyExplorer({
  dates,
  initialDate,
  initialReport,
}: {
  dates: string[];
  initialDate: string;
  initialReport: DailyReport;
}) {
  const [date, setDate] = useState(initialDate);
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (date === initialDate) {
      setReport(initialReport);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/data/daily/${date}.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error("这一天还没有数据");
        return res.json() as Promise<DailyReport>;
      })
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, initialDate, initialReport]);

  const summary = report.summary;

  return (
    <div className="space-y-5">
      <header className="page-header flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">每日行情</p>
          <h1 className="page-title">按日报价</h1>
          <p className="mt-2 text-sm text-muted">当前交易日 {date}</p>
        </div>
        <label className="text-sm text-muted">
          交易日
          <select className="field-select" value={date} onChange={(e) => setDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error ? (
        <p className="text-sm text-up">{error}</p>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              {
                label: "上证",
                value: `${summary.indexClose.toFixed(2)} (${formatPct(summary.indexPct)})`,
                cls: pctClass(summary.indexPct),
              },
              { label: "涨停", value: String(summary.limitUp), cls: "text-up" },
              { label: "跌停", value: String(summary.limitDown), cls: "text-down" },
              { label: "情绪", value: summary.sentiment, cls: "" },
            ].map((item) => (
              <div key={item.label} className="metric-tile">
                <p className="text-xs text-muted">{item.label}</p>
                <p className={`mt-2 text-xl font-semibold font-num ${item.cls}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="panel p-4 md:p-5">
            <p className="text-xs text-muted">{report.date}</p>
            <p className="mt-2 text-base leading-7">{loading ? "加载中…" : summary.oneLiner}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {report.interpretation}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-4 md:p-5">
              <div className="panel-header">
                <SectionTitle title={`涨停 · ${report.date}`} />
              </div>
              <StockTable rows={report.limitUp} showReason asOfDate={report.date} />
            </div>
            <div className="panel p-4 md:p-5">
              <div className="panel-header">
                <SectionTitle title={`跌幅靠前 · ${report.date}`} />
              </div>
              <StockTable rows={report.topLosers} showReason asOfDate={report.date} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-4 md:p-5">
              <div className="panel-header">
                <SectionTitle title={`涨幅榜 · ${report.date}`} />
              </div>
              <StockTable rows={report.topGainers} asOfDate={report.date} />
            </div>
            <div className="panel p-4 md:p-5">
              <div className="panel-header">
                <SectionTitle title={`偏弱样本 · ${report.date}`} />
              </div>
              <StockTable rows={report.limitDown} showReason asOfDate={report.date} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { PeriodReport, PeriodStock } from "@/lib/types";
import { Pct } from "@/components/StockTable";
import { PeriodSwitcher } from "@/components/SectorList";

function PeriodTable({ rows }: { rows: PeriodStock[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[560px]">
        <thead>
          <tr>
            <th>名称</th>
            <th>行业</th>
            <th>7天</th>
            <th>14天</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code}>
              <td>
                <div>{row.name}</div>
                <div className="font-num text-xs text-muted">{row.code}</div>
              </td>
              <td className="text-muted">{row.sector}</td>
              <td>
                <Pct value={row.pct7d} />
              </td>
              <td>
                <Pct value={row.pct14d} />
              </td>
              <td className="text-muted">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PeriodExplorer({ report }: { report: PeriodReport }) {
  const [mode, setMode] = useState<"7d" | "14d">("7d");
  const gainers = mode === "7d" ? report.gainers7d : report.gainers14d;
  const losers = mode === "7d" ? report.losers7d : report.losers14d;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <PeriodSwitcher mode={mode} onChange={setMode} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4 md:p-5">
          <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">区间偏强</h3>
          <PeriodTable rows={gainers} />
        </div>
        <div className="panel p-4 md:p-5">
          <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">区间偏弱</h3>
          <PeriodTable rows={losers} />
        </div>
      </div>
    </div>
  );
}

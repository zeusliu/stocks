import { formatPct, pctClass } from "@/lib/data";
import type { StockMove } from "@/lib/types";

export function Pct({ value }: { value: number }) {
  return <span className={`font-num font-medium ${pctClass(value)}`}>{formatPct(value)}</span>;
}

export function StockTable({
  rows,
  showReason = false,
  asOfDate,
}: {
  rows: StockMove[];
  showReason?: boolean;
  asOfDate?: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted">暂无数据</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className={`data-table ${asOfDate ? "min-w-[560px]" : "min-w-[460px]"}`}>
        <thead>
          <tr>
            {asOfDate ? <th>日期</th> : null}
            <th>代码</th>
            <th>名称</th>
            <th>涨跌幅</th>
            <th>现价</th>
            {showReason ? <th>原因</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code}>
              {asOfDate ? <td className="font-num text-muted">{asOfDate}</td> : null}
              <td className="font-num text-xs text-muted">{row.code}</td>
              <td>{row.name}</td>
              <td>
                <Pct value={row.pct} />
              </td>
              <td className="font-num">{row.price.toFixed(2)}</td>
              {showReason ? <td className="text-muted">{row.reason ?? "—"}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

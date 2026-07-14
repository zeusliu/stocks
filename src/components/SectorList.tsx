import type { SectorMove } from "@/lib/types";
import { Pct } from "@/components/StockTable";
import { SectionTitle } from "@/components/SiteChrome";

export function SectorList({ sectors }: { sectors: SectorMove[] }) {
  if (!sectors.length) {
    return <p className="text-sm text-muted">暂无行业数据</p>;
  }
  const max = Math.max(...sectors.map((s) => Math.abs(s.pct)), 1);

  return (
    <div className="panel p-4 md:p-5">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[640px]">
          <thead>
            <tr>
              <th>行业</th>
              <th>涨跌</th>
              <th>强度</th>
              <th>代表票</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map((sector) => (
              <tr key={sector.name}>
                <td className="whitespace-nowrap font-medium">{sector.name}</td>
                <td>
                  <Pct value={sector.pct} />
                </td>
                <td className="min-w-[120px]">
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(Math.abs(sector.pct) / max) * 100}%`,
                        background: sector.pct >= 0 ? "var(--up)" : "var(--down)",
                      }}
                    />
                  </div>
                </td>
                <td className="text-muted">{sector.leaders.join("、")}</td>
                <td className="max-w-[320px] text-[var(--text-secondary)]">{sector.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PeriodSwitcher({
  mode,
  onChange,
}: {
  mode: "7d" | "14d";
  onChange: (mode: "7d" | "14d") => void;
}) {
  return (
    <div className="inline-flex rounded-[8px] border border-[var(--line)] p-1">
      {(
        [
          { id: "7d", label: "近7天" },
          { id: "14d", label: "近14天" },
        ] as const
      ).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            mode === item.id
              ? "bg-[var(--accent-soft)] text-[#bfdbfe]"
              : "text-muted hover:text-[var(--text)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function PeriodPanelTitle() {
  return <SectionTitle title="周期涨跌" subtitle="持续强 vs 持续弱" />;
}

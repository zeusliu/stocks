import Link from "next/link";
import type { ReactNode } from "react";
import { Disclaimer, SectionTitle } from "@/components/SiteChrome";
import { StockTable, Pct } from "@/components/StockTable";
import { formatPct } from "@/lib/data";
import {
  loadDaily,
  loadIndex,
  loadPeriods,
  loadRecommendations,
  loadReviews,
} from "@/lib/load-server";
import type { PlanItem, Recommendation, Review, SectorMove, TodaySellItem } from "@/lib/types";

const accuracyLabel = {
  beat: "超预期",
  met: "准",
  miss: "不准",
} as const;

const accuracyClass = {
  beat: "text-up",
  met: "text-[var(--accent)]",
  miss: "text-down",
} as const;

export default async function HomePage() {
  const index = await loadIndex();
  const daily = await loadDaily(index.latestDate);
  const periods = await loadPeriods();
  const recommendations = await loadRecommendations();
  const reviews = await loadReviews();

  const watching = recommendations.items.filter((i) => i.status === "watching");
  const reviewedCount = recommendations.items.filter((i) => i.status === "reviewed").length;
  const plan1 = recommendations.plans.find((p) => p.horizonDays === 1);
  const plan3 = recommendations.plans.find((p) => p.horizonDays === 3);
  const plan7 = recommendations.plans.find((p) => p.horizonDays === 7);

  return (
    <div className="space-y-8">
      <section className="hero-surface">
        <p className="page-kicker">最新交易日 {daily.date}</p>
        <h1 className="page-title">看懂今日行情</h1>
        <p className="page-desc">{daily.summary.oneLiner}</p>
        <div className="hero-actions">
          <Link href="/daily/" className="btn-primary">
            打开每日行情
          </Link>
          <Link href="/recommend/" className="btn-ghost">
            查看买卖建议
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric
          className="sm:col-span-2"
          label={daily.summary.indexName}
          value={
            <span className="font-num">
              {daily.summary.indexClose.toFixed(2)}{" "}
              <span className="text-lg font-medium">
                <Pct value={daily.summary.indexPct} />
              </span>
            </span>
          }
        />
        <Metric label="涨停" value={<span className="text-up">{daily.summary.limitUp}</span>} />
        <Metric label="跌停" value={<span className="text-down">{daily.summary.limitDown}</span>} />
        <Metric label="情绪" value={daily.summary.sentiment} />
        <Metric label="观察 / 复盘" value={`${watching.length} / ${reviews.items.length}`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-5">
        <div className="panel p-5 md:p-6 xl:col-span-3">
          <div className="panel-header">
            <SectionTitle title={`涨停 · ${daily.date}`} subtitle="当日涨停池样本" />
            <Link href="/daily/" className="table-link">
              按日查看 →
            </Link>
          </div>
          <StockTable rows={daily.limitUp} showReason asOfDate={daily.date} />
        </div>

        <div className="panel p-5 md:p-6 xl:col-span-2">
          <div className="panel-header">
            <SectionTitle title="行业" subtitle={daily.date} />
            <Link href="/industry/" className="table-link">
              全部 →
            </Link>
          </div>
          <SectorCompact sectors={daily.sectors.slice(0, 6)} />
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <div className="panel-header">
          <SectionTitle title="周期强弱" subtitle={`截至 ${periods.asOf}`} />
          <Link href="/periods/" className="table-link">
            7 / 14 天 →
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <MiniPeriod title="偏强" rows={periods.gainers7d.slice(0, 5)} />
          <MiniPeriod title="偏弱" rows={periods.losers7d.slice(0, 5)} />
        </div>
      </section>

      <section className="space-y-5">
        <div className="panel-header">
          <SectionTitle
            title="买卖建议"
            subtitle={`${recommendations.asOf} · 可抛 ${recommendations.todaySell.length} · 含 1/3/7 天计划`}
          />
          <Link href="/recommend/" className="table-link">
            完整建议 →
          </Link>
        </div>

        <div className="panel p-5 md:p-6">
          <h3 className="mb-4 text-sm font-medium text-up">今日可抛</h3>
          <HomeSellTable rows={recommendations.todaySell} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { title: "未来 1 天", rows: plan1?.items ?? [] },
            { title: "未来 3 天", rows: plan3?.items ?? [] },
            { title: "未来 7 天", rows: plan7?.items ?? [] },
          ].map((block) => (
            <div key={block.title} className="panel p-5 md:p-6">
              <h3 className="mb-4 text-sm font-medium">{block.title}</h3>
              <HomePlanTable rows={block.rows.slice(0, 4)} />
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel p-5 md:p-6">
            <div className="panel-header">
              <SectionTitle title="观察中" subtitle={`${watching.length} 条`} />
            </div>
            <HomeRecTable rows={watching.slice(0, 5)} />
          </div>
          <div className="panel p-5 md:p-6">
            <div className="panel-header">
              <SectionTitle title="复盘" subtitle={`${reviewedCount} 条已复盘`} />
              <Link href="/review/" className="table-link">
                全部复盘 →
              </Link>
            </div>
            <HomeReviewTable rows={reviews.items.slice(0, 5)} />
          </div>
        </div>
      </section>

      <Disclaimer text={index.disclaimer} />
    </div>
  );
}

function Metric({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={`metric-tile ${className}`}>
      <p className="text-xs tracking-wide text-muted">{label}</p>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function SectorCompact({ sectors }: { sectors: SectorMove[] }) {
  if (!sectors.length) {
    return <p className="text-sm text-muted">暂无行业数据</p>;
  }
  const max = Math.max(...sectors.map((s) => Math.abs(s.pct)), 1);
  return (
    <div className="space-y-3">
      {sectors.map((sector) => (
        <div key={sector.name}>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span>{sector.name}</span>
            <Pct value={sector.pct} />
          </div>
          <div className="bar-track mt-1.5">
            <div
              className="bar-fill"
              style={{
                width: `${(Math.abs(sector.pct) / max) * 100}%`,
                background: sector.pct >= 0 ? "var(--up)" : "var(--down)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniPeriod({
  title,
  rows,
}: {
  title: string;
  rows: { code: string; name: string; pct7d: number; sector: string }[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
      <div className="overflow-x-auto">
        <table className="data-table min-w-[300px]">
          <thead>
            <tr>
              <th>名称</th>
              <th>行业</th>
              <th>7天</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code}>
                <td>
                  {row.name}
                  <div className="font-num text-xs text-muted">{row.code}</div>
                </td>
                <td className="text-muted">{row.sector}</td>
                <td>
                  <Pct value={row.pct7d} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HomeSellTable({ rows }: { rows: TodaySellItem[] }) {
  if (!rows.length) return <p className="text-sm text-muted">今日暂无建议抛售</p>;
  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[560px]">
        <thead>
          <tr>
            <th>名称</th>
            <th>建仓日</th>
            <th>表现</th>
            <th>理由</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>
                {item.name}
                <div className="font-num text-xs text-muted">{item.code}</div>
              </td>
              <td className="font-num text-muted">{item.entryDate}</td>
              <td>
                <Pct value={item.heldPct} />
              </td>
              <td className="max-w-[280px] text-muted">{item.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HomePlanTable({ rows }: { rows: PlanItem[] }) {
  if (!rows.length) return <p className="text-sm text-muted">暂无建议</p>;
  const actionLabel = { buy: "买", sell: "卖", hold: "持" } as const;
  const actionClass = { buy: "text-up", sell: "text-down", hold: "text-[var(--accent)]" } as const;
  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[260px]">
        <thead>
          <tr>
            <th>动作</th>
            <th>名称</th>
            <th>预期</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className={actionClass[item.action]}>{actionLabel[item.action]}</td>
              <td>
                {item.name}
                <div className="font-num text-[11px] text-muted">{item.code}</div>
              </td>
              <td>
                <Pct value={item.expectedPct} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HomeRecTable({ rows }: { rows: Recommendation[] }) {
  if (!rows.length) return <p className="text-sm text-muted">暂无观察中推荐</p>;
  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[420px]">
        <thead>
          <tr>
            <th>推荐日</th>
            <th>名称</th>
            <th>窗口</th>
            <th>目标</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="font-num text-muted">{item.date}</td>
              <td>
                {item.name}
                <div className="font-num text-xs text-muted">{item.code}</div>
              </td>
              <td>{item.horizonDays} 天</td>
              <td className="max-w-[180px] text-muted">{item.targetNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HomeReviewTable({ rows }: { rows: Review[] }) {
  if (!rows.length) return <p className="text-sm text-muted">暂无复盘</p>;
  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[420px]">
        <thead>
          <tr>
            <th>名称</th>
            <th>准不准</th>
            <th>实际</th>
            <th>偏差</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const gap = item.actualPct - item.expectedPct;
            return (
              <tr key={item.id}>
                <td>
                  {item.name}
                  <div className="font-num text-xs text-muted">{item.code}</div>
                </td>
                <td className={accuracyClass[item.result]}>{accuracyLabel[item.result]}</td>
                <td>
                  <Pct value={item.actualPct} />
                </td>
                <td>
                  <Pct value={gap} />
                  <div className="text-xs text-muted">预期 {formatPct(item.expectedPct)}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

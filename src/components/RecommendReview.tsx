import type {
  HorizonPlan,
  PlanItem,
  Recommendation,
  RecommendationsFile,
  Review,
  TodaySellItem,
  TradeAction,
} from "@/lib/types";
import { formatPct } from "@/lib/data";
import { Pct } from "@/components/StockTable";
import { SectionTitle } from "@/components/SiteChrome";

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

const statusLabel = {
  watching: "观察中",
  reviewed: "已复盘",
} as const;

const actionLabel: Record<TradeAction, string> = {
  buy: "买入关注",
  sell: "卖出/减仓",
  hold: "继续持有",
};

const actionClass: Record<TradeAction, string> = {
  buy: "text-up",
  sell: "text-down",
  hold: "text-[var(--accent)]",
};

type RecommendRow = Recommendation & { review?: Review };

function withReviews(items: Recommendation[], reviews: Review[]): RecommendRow[] {
  const byRecId = new Map(reviews.map((r) => [r.recommendationId, r]));
  return items.map((item) => ({
    ...item,
    review: byRecId.get(item.id),
  }));
}

export function RecommendList({
  data,
  reviews,
}: {
  data: RecommendationsFile;
  reviews: Review[];
}) {
  const rows = withReviews(data.items, reviews);
  const watching = rows.filter((i) => i.status === "watching");
  const reviewed = rows.filter((i) => i.status === "reviewed");
  const plans = [...data.plans].sort((a, b) => a.horizonDays - b.horizonDays);

  return (
    <div className="space-y-6">
      <section className="panel p-4 md:p-5">
        <div className="panel-header">
          <SectionTitle
            title={`今日可抛售 · ${data.asOf}`}
            subtitle={`${data.todaySell.length} 只到达抛售/兑现窗口`}
          />
        </div>
        <TodaySellTable rows={data.todaySell} />
      </section>

      {plans.map((plan) => (
        <PlanSection key={plan.horizonDays} plan={plan} asOf={data.asOf} />
      ))}

      <section className="panel p-4 md:p-5">
        <div className="panel-header">
          <SectionTitle title="历史观察中" subtitle="尚未到期，跟踪中" />
        </div>
        <RecommendTable rows={watching} emptyText="暂无观察中的推荐" />
      </section>

      <section className="panel p-4 md:p-5">
        <div className="panel-header">
          <SectionTitle title="已进入复盘" subtitle="准不准与偏差" />
        </div>
        <RecommendTable rows={reviewed} emptyText="暂无已复盘推荐" />
      </section>
    </div>
  );
}

function PlanSection({ plan, asOf }: { plan: HorizonPlan; asOf: string }) {
  const buys = plan.items.filter((i) => i.action === "buy").length;
  const sells = plan.items.filter((i) => i.action === "sell").length;
  const holds = plan.items.filter((i) => i.action === "hold").length;

  return (
    <section className="panel p-4 md:p-5">
      <div className="panel-header">
        <SectionTitle
          title={`${plan.title}建议`}
          subtitle={`基准日 ${asOf} · 买 ${buys} / 卖 ${sells} / 持有 ${holds}`}
        />
      </div>
      <PlanTable rows={plan.items} emptyText={`暂无 ${plan.title} 建议`} />
    </section>
  );
}

function TodaySellTable({ rows }: { rows: TodaySellItem[] }) {
  if (!rows.length) {
    return <p className="text-sm text-muted">今日暂无建议抛售标的</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[820px]">
        <thead>
          <tr>
            <th>建议日</th>
            <th>代码</th>
            <th>名称</th>
            <th>行业</th>
            <th>建仓/观察日</th>
            <th>窗口</th>
            <th>持仓表现</th>
            <th>抛售理由</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="font-num text-muted">{item.suggestDate}</td>
              <td className="font-num text-xs text-muted">{item.code}</td>
              <td>
                {item.name}
                <div className={`text-xs ${actionClass.sell}`}>{actionLabel.sell}</div>
              </td>
              <td className="text-muted">{item.sector}</td>
              <td className="font-num text-muted">{item.entryDate}</td>
              <td>{item.horizonDays} 天</td>
              <td>
                <Pct value={item.heldPct} />
              </td>
              <td className="max-w-[280px] text-[var(--text-secondary)]">{item.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlanTable({ rows, emptyText }: { rows: PlanItem[]; emptyText: string }) {
  if (!rows.length) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[900px]">
        <thead>
          <tr>
            <th>动作</th>
            <th>代码</th>
            <th>名称</th>
            <th>行业</th>
            <th>建议参考日</th>
            <th>预期涨跌</th>
            <th>逻辑</th>
            <th>操作提示</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className={actionClass[item.action]}>{actionLabel[item.action]}</td>
              <td className="font-num text-xs text-muted">{item.code}</td>
              <td>{item.name}</td>
              <td className="text-muted">{item.sector}</td>
              <td className="font-num text-muted">{item.suggestDate}</td>
              <td>
                <Pct value={item.expectedPct} />
              </td>
              <td className="max-w-[220px] text-[var(--text-secondary)]">{item.thesis}</td>
              <td className="max-w-[240px] text-muted">{item.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecommendTable({
  rows,
  emptyText,
}: {
  rows: RecommendRow[];
  emptyText: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[900px]">
        <thead>
          <tr>
            <th>推荐日</th>
            <th>代码</th>
            <th>名称</th>
            <th>窗口</th>
            <th>推荐逻辑</th>
            <th>观察目标</th>
            <th>准不准</th>
            <th>预期</th>
            <th>实际</th>
            <th>偏差</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const review = item.review;
            const gapPct = review != null ? review.actualPct - review.expectedPct : null;

            return (
              <tr key={item.id}>
                <td className="font-num text-muted">{item.date}</td>
                <td className="font-num text-xs text-muted">{item.code}</td>
                <td>{item.name}</td>
                <td>{item.horizonDays} 天</td>
                <td className="max-w-[220px] text-[var(--text-secondary)]">{item.thesis}</td>
                <td className="max-w-[200px] text-muted">{item.targetNote}</td>
                <td>
                  {review ? (
                    <span className={accuracyClass[review.result]}>
                      {accuracyLabel[review.result]}
                    </span>
                  ) : (
                    <span className="text-muted">待复盘</span>
                  )}
                </td>
                <td>
                  {review ? (
                    <span className="font-num text-muted">{formatPct(review.expectedPct)}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  {review ? <Pct value={review.actualPct} /> : <span className="text-muted">—</span>}
                </td>
                <td>
                  {gapPct != null ? <Pct value={gapPct} /> : <span className="text-muted">—</span>}
                </td>
                <td className="text-[var(--accent)]">{statusLabel[item.status]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ReviewList({ items }: { items: Review[] }) {
  return (
    <section className="panel p-4 md:p-5">
      <div className="panel-header">
        <SectionTitle title="复盘对照表" subtitle="准不准、偏差与原因" />
      </div>
      <ReviewTable rows={items} />
    </section>
  );
}

function ReviewTable({ rows }: { rows: Review[] }) {
  if (!rows.length) {
    return <p className="text-sm text-muted">暂无复盘数据</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-[1040px]">
        <thead>
          <tr>
            <th>名称</th>
            <th>代码</th>
            <th>推荐日</th>
            <th>复盘日</th>
            <th>窗口</th>
            <th>准不准</th>
            <th>预期</th>
            <th>实际</th>
            <th>偏差</th>
            <th>当时预期</th>
            <th>差异一句话</th>
            <th>差异原因</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const gapPct = item.actualPct - item.expectedPct;
            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td className="font-num text-xs text-muted">{item.code}</td>
                <td className="font-num text-muted">{item.recommendDate}</td>
                <td className="font-num text-muted">{item.reviewDate}</td>
                <td>{item.horizonDays} 天</td>
                <td className={accuracyClass[item.result]}>{accuracyLabel[item.result]}</td>
                <td className="font-num text-muted">{formatPct(item.expectedPct)}</td>
                <td>
                  <Pct value={item.actualPct} />
                </td>
                <td>
                  <Pct value={gapPct} />
                </td>
                <td className="max-w-[180px] text-[var(--text-secondary)]">{item.expectedNote}</td>
                <td className="max-w-[180px] text-muted">{item.gapNote}</td>
                <td className="max-w-[260px] text-[var(--text-secondary)]">{item.gapReason}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

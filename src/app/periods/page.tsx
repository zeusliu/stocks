import { PeriodExplorer } from "@/components/PeriodExplorer";
import { Disclaimer, PageHeader } from "@/components/SiteChrome";
import { loadIndex, loadPeriods } from "@/lib/load-server";

export default async function PeriodsPage() {
  const index = await loadIndex();
  const periods = await loadPeriods();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={`截至 ${periods.asOf}`}
        title="周期强弱"
        description="看近 7 / 14 天持续偏强与偏弱样本"
      />
      <PeriodExplorer report={periods} />
      <Disclaimer text={index.disclaimer} />
    </div>
  );
}

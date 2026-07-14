import { SectorList } from "@/components/SectorList";
import { Disclaimer, PageHeader } from "@/components/SiteChrome";
import { loadDaily, loadIndex } from "@/lib/load-server";

export default async function IndustryPage() {
  const index = await loadIndex();
  const daily = await loadDaily(index.latestDate);

  return (
    <div className="space-y-6">
      <PageHeader kicker={daily.date} title="行业走势" description={daily.interpretation} />
      <SectorList sectors={daily.sectors} />
      <Disclaimer text={index.disclaimer} />
    </div>
  );
}

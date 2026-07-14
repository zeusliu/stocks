import { DailyExplorer } from "@/components/DailyExplorer";
import { Disclaimer } from "@/components/SiteChrome";
import { loadDaily, loadIndex } from "@/lib/load-server";

export default async function DailyPage() {
  const index = await loadIndex();
  const report = await loadDaily(index.latestDate);

  return (
    <div>
      <DailyExplorer
        dates={[...index.dates].reverse()}
        initialDate={index.latestDate}
        initialReport={report}
      />
      <div className="mt-10">
        <Disclaimer text={index.disclaimer} />
      </div>
    </div>
  );
}

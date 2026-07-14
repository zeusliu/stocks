import { RecommendList } from "@/components/RecommendReview";
import { Disclaimer, PageHeader } from "@/components/SiteChrome";
import { loadIndex, loadRecommendations, loadReviews } from "@/lib/load-server";

export default async function RecommendPage() {
  const index = await loadIndex();
  const data = await loadRecommendations();
  const reviews = await loadReviews();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={`基准日 ${data.asOf}`}
        title="买卖建议"
        description="今日可抛，以及未来 1 / 3 / 7 天计划"
      />
      <RecommendList data={data} reviews={reviews.items} />
      <Disclaimer text={index.disclaimer} />
    </div>
  );
}

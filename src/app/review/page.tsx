import { ReviewList } from "@/components/RecommendReview";
import { Disclaimer, PageHeader } from "@/components/SiteChrome";
import { loadIndex, loadReviews } from "@/lib/load-server";

export default async function ReviewPage() {
  const index = await loadIndex();
  const data = await loadReviews();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={`更新于 ${data.updatedAt}`}
        title="推荐复盘"
        description="对照预期与实际，看准不准和偏差原因"
      />
      <ReviewList items={data.items} />
      <Disclaimer text={index.disclaimer} />
    </div>
  );
}

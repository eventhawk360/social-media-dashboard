import { Card } from "@/components/Card";
import { LiveFeed } from "@/components/LiveFeed";
import { livePosts } from "@/lib/live";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const posts = await livePosts(7);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Live performance</h1>
        <p className="text-sm text-slate-600">
          Posts from the last 7 days, ranked by momentum (views gained per hour). The list
          re-checks the database every 30 seconds. Metrics refresh as fast as the ingest
          poll runs — set the cron in <code>vercel.json</code> to every 5 minutes for the
          tightest loop the platform APIs allow.
        </p>
      </header>

      <Card>
        <LiveFeed initial={posts} />
      </Card>
    </div>
  );
}

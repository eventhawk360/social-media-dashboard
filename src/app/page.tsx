import { Card, Stat, PerformanceBadge } from "@/components/Card";
import { PlatformBars, PlatformShare } from "@/components/Charts";
import { platformTotals, rankedPosts } from "@/lib/analytics";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [totals, ranked, postCount, campaignCount, openAlerts] = await Promise.all([
    platformTotals(),
    rankedPosts(5),
    prisma.post.count(),
    prisma.campaign.count(),
    prisma.alert.count({ where: { resolvedAt: null } }),
  ]);

  const totalReach = totals.reduce((a, t) => a + t.reach, 0);
  const totalViewers = totals.reduce((a, t) => a + t.viewers, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Campaigns" value={String(campaignCount)} />
        <Stat label="Posts tracked" value={String(postCount)} />
        <Stat label="Total reach" value={totalReach.toLocaleString()} />
        <Stat label="Total views" value={totalViewers.toLocaleString()} hint={`${openAlerts} open alert${openAlerts === 1 ? "" : "s"}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Reach vs views by platform">
          <PlatformBars data={totals.map((t) => ({ platform: t.platform, reach: t.reach, viewers: t.viewers }))} />
        </Card>
        <Card title="Share of views">
          <PlatformShare data={totals.map((t) => ({ platform: t.platform, viewers: t.viewers }))} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Top 5 posts (by views)">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr><th className="py-1">Campaign</th><th>Platform</th><th className="text-right">Views</th><th className="text-right">Reach</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {ranked.top.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.campaign}</td>
                  <td>{p.platform}</td>
                  <td className="text-right">{p.viewers.toLocaleString()}</td>
                  <td className="text-right">{p.reach.toLocaleString()}</td>
                  <td><PerformanceBadge value={p.performance} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Bottom 5 posts (by views)">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr><th className="py-1">Campaign</th><th>Platform</th><th className="text-right">Views</th><th className="text-right">Reach</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {ranked.bottom.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.campaign}</td>
                  <td>{p.platform}</td>
                  <td className="text-right">{p.viewers.toLocaleString()}</td>
                  <td className="text-right">{p.reach.toLocaleString()}</td>
                  <td><PerformanceBadge value={p.performance} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

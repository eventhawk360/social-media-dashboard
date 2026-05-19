import { notFound } from "next/navigation";
import { Card, PerformanceBadge, Stat } from "@/components/Card";
import { PlatformBars } from "@/components/Charts";
import { prisma } from "@/lib/db";
import { engagementRate } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function CampaignDetail({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { posts: { include: { metrics: { orderBy: { capturedAt: "asc" } } } } },
  });
  if (!campaign) return notFound();

  const totalReach = campaign.posts.reduce((a, p) => a + (p.reach ?? 0), 0);
  const totalViewers = campaign.posts.reduce((a, p) => a + (p.viewers ?? 0), 0);

  const platformAgg = ["facebook", "instagram", "tiktok", "youtube"].map((pf) => {
    const ps = campaign.posts.filter((p) => p.platform === pf);
    return {
      platform: pf,
      reach: ps.reduce((a, p) => a + (p.reach ?? 0), 0),
      viewers: ps.reduce((a, p) => a + (p.viewers ?? 0), 0),
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{campaign.name}</h1>
        <p className="text-sm text-slate-600">{campaign.purpose ?? ""}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Posts" value={String(campaign.posts.length)} />
        <Stat label="Total reach" value={totalReach.toLocaleString()} />
        <Stat label="Total views" value={totalViewers.toLocaleString()} />
        <Stat label="Audience" value={campaign.audience ?? "—"} />
      </div>

      <Card title="By platform">
        <PlatformBars data={platformAgg} />
      </Card>

      <Card title="Posts">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-1">Platform</th>
              <th>Type</th>
              <th>Published</th>
              <th className="text-right">Reach</th>
              <th className="text-right">Views</th>
              <th className="text-right">Eng. ratio</th>
              <th>Rating</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {campaign.posts.map((p) => (
              <tr key={p.id} className="border-t align-top">
                <td className="py-2">{p.platform}</td>
                <td>{p.postType}</td>
                <td>{p.publishedAt ? p.publishedAt.toISOString().slice(0, 10) : "—"}</td>
                <td className="text-right">{(p.reach ?? 0).toLocaleString()}</td>
                <td className="text-right">{(p.viewers ?? 0).toLocaleString()}</td>
                <td className="text-right">{p.reach && p.viewers ? `${((engagementRate(p) ?? 0) * 100).toFixed(0)}%` : "—"}</td>
                <td><PerformanceBadge value={p.performance} /></td>
                <td className="max-w-[18rem] text-xs text-slate-500">{p.notes ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

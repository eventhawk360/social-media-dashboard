import Link from "next/link";
import { Card, PerformanceBadge } from "@/components/Card";
import { CampaignBars } from "@/components/Charts";
import { campaignSummaries } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await campaignSummaries();
  const chartData = campaigns
    .filter((c) => c.totalViewers > 0 || c.totalReach > 0)
    .sort((a, b) => b.totalViewers - a.totalViewers)
    .map((c) => ({ name: c.name, viewers: c.totalViewers, reach: c.totalReach }));

  return (
    <div className="space-y-6">
      <Card title="Campaign comparison (by total views)">
        <CampaignBars data={chartData} />
      </Card>

      <Card title={`All campaigns (${campaigns.length})`}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-1">Name</th>
              <th>Purpose</th>
              <th>Platforms</th>
              <th className="text-right">Posts</th>
              <th className="text-right">Reach</th>
              <th className="text-right">Views</th>
              <th className="text-right">Eng. ratio</th>
              <th>Best</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-2">
                  <Link href={`/campaigns/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
                </td>
                <td className="text-slate-600">{c.purpose ?? "—"}</td>
                <td className="text-xs text-slate-500">{c.platforms.join(", ")}</td>
                <td className="text-right">{c.posts}</td>
                <td className="text-right">{c.totalReach.toLocaleString()}</td>
                <td className="text-right">{c.totalViewers.toLocaleString()}</td>
                <td className="text-right">{(c.avgEngagement * 100).toFixed(0)}%</td>
                <td><PerformanceBadge value={c.bestPerformance} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

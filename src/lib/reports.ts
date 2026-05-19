import { prisma } from "./db";
import { platformTotals, rankedPosts, campaignSummaries } from "./analytics";
import { recomputeAlerts } from "./alerts";

export type ReportKind = "weekly" | "monthly";

export async function buildReport(kind: ReportKind, periodEnd = new Date()) {
  const days = kind === "weekly" ? 7 : 30;
  const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000);

  const [totals, ranked, campaigns, alerts] = await Promise.all([
    platformTotals(),
    rankedPosts(5),
    campaignSummaries(),
    (async () => {
      await recomputeAlerts();
      return prisma.alert.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
    })(),
  ]);

  const totalReach = totals.reduce((a, t) => a + t.reach, 0);
  const totalViewers = totals.reduce((a, t) => a + t.viewers, 0);

  const bestCampaign = campaigns.sort((a, b) => b.totalViewers - a.totalViewers)[0];
  const worstCampaign = campaigns
    .filter((c) => c.totalViewers > 0)
    .sort((a, b) => a.totalViewers - b.totalViewers)[0];

  const recommendations: string[] = [];
  if (bestCampaign) {
    recommendations.push(
      `Lean into "${bestCampaign.name}" format — ${bestCampaign.totalViewers.toLocaleString()} views across ${bestCampaign.posts} posts.`,
    );
  }
  const weakPlatform = totals.filter((t) => t.posts > 2).sort((a, b) => a.avgEngagement - b.avgEngagement)[0];
  if (weakPlatform) {
    recommendations.push(
      `${weakPlatform.platform} has the lowest reach/views ratio (${(weakPlatform.avgEngagement * 100).toFixed(0)}%) — test new hook lengths or post times.`,
    );
  }
  const tiktokVsYoutube = totals.find((t) => t.platform === "tiktok");
  if (tiktokVsYoutube && tiktokVsYoutube.posts < 5) {
    recommendations.push(
      `TikTok under-posted (${tiktokVsYoutube.posts} posts in window) — increase cadence; static posts already produced "good" ratings.`,
    );
  }

  const summary = [
    `${kind === "weekly" ? "Weekly" : "Monthly"} social report`,
    `${periodStart.toISOString().slice(0, 10)} → ${periodEnd.toISOString().slice(0, 10)}`,
    `Total reach: ${totalReach.toLocaleString()} | Total views: ${totalViewers.toLocaleString()}`,
    bestCampaign ? `Best campaign: ${bestCampaign.name}` : "",
    worstCampaign ? `Needs work: ${worstCampaign.name}` : "",
  ].filter(Boolean).join("\n");

  const payload = {
    totals,
    top: ranked.top,
    bottom: ranked.bottom,
    campaigns,
    alerts,
    recommendations,
  };

  const payloadJson = JSON.stringify(payload);
  const report = await prisma.report.upsert({
    where: { kind_periodStart: { kind, periodStart } },
    create: { kind, periodStart, periodEnd, summary, payload: payloadJson },
    update: { periodEnd, summary, payload: payloadJson },
  });

  return report;
}

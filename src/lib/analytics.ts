import { prisma } from "./db";
import { engagementRate, performanceRank, type Platform, type Performance } from "./scoring";

export type PlatformTotals = {
  platform: string;
  posts: number;
  reach: number;
  viewers: number;
  avgEngagement: number;
};

export async function platformTotals(): Promise<PlatformTotals[]> {
  const grouped = await prisma.post.groupBy({
    by: ["platform"],
    _sum: { reach: true, viewers: true },
    _count: { _all: true },
  });

  return grouped.map((g) => {
    const reach = g._sum.reach ?? 0;
    const viewers = g._sum.viewers ?? 0;
    return {
      platform: g.platform,
      posts: g._count._all,
      reach,
      viewers,
      avgEngagement: viewers > 0 ? reach / viewers : 0,
    };
  });
}

export type CampaignSummary = {
  id: string;
  name: string;
  purpose: string | null;
  posts: number;
  totalReach: number;
  totalViewers: number;
  avgEngagement: number;
  bestPerformance: string | null;
  platforms: string[];
};

export async function campaignSummaries(): Promise<CampaignSummary[]> {
  const campaigns = await prisma.campaign.findMany({
    include: { posts: true },
    orderBy: { name: "asc" },
  });

  return campaigns.map((c) => {
    const totalReach = c.posts.reduce((acc, p) => acc + (p.reach ?? 0), 0);
    const totalViewers = c.posts.reduce((acc, p) => acc + (p.viewers ?? 0), 0);
    const best = c.posts
      .map((p) => p.performance)
      .reduce<string | null>(
        (acc, perf) => (performanceRank(perf) > performanceRank(acc) ? perf : acc),
        null,
      );
    return {
      id: c.id,
      name: c.name,
      purpose: c.purpose,
      posts: c.posts.length,
      totalReach,
      totalViewers,
      avgEngagement: totalViewers > 0 ? totalReach / totalViewers : 0,
      bestPerformance: best,
      platforms: Array.from(new Set(c.posts.map((p) => p.platform))),
    };
  });
}

export type RankedPost = {
  id: string;
  campaign: string;
  platform: string;
  reach: number;
  viewers: number;
  engagement: number;
  performance: string | null;
  publishedAt: Date | null;
};

export async function rankedPosts(limit = 5) {
  const posts = await prisma.post.findMany({
    where: { OR: [{ reach: { gt: 0 } }, { viewers: { gt: 0 } }] },
    include: { campaign: true },
  });

  const enriched: RankedPost[] = posts.map((p) => ({
    id: p.id,
    campaign: p.campaign.name,
    platform: p.platform,
    reach: p.reach ?? 0,
    viewers: p.viewers ?? 0,
    engagement: engagementRate(p) ?? 0,
    performance: p.performance,
    publishedAt: p.publishedAt,
  }));

  const byViewers = [...enriched].sort((a, b) => b.viewers - a.viewers);
  return {
    top: byViewers.slice(0, limit),
    bottom: byViewers
      .filter((p) => p.viewers > 0)
      .sort((a, b) => a.viewers - b.viewers)
      .slice(0, limit),
  };
}

import { prisma } from "./db";
import { engagementRate } from "./scoring";

export type LivePost = {
  id: string;
  campaign: string;
  platform: string;
  caption: string | null;
  permalink: string | null;
  publishedAt: Date | null;
  reach: number;
  viewers: number;
  engagement: number;
  // Momentum: views gained per hour, from the two most recent snapshots.
  viewsPerHour: number | null;
  // Lifetime pace since publish.
  viewsPerHourLifetime: number | null;
  lastUpdated: Date | null;
  momentum: "surging" | "steady" | "cooling" | "new" | "flat";
};

function classifyMomentum(perHour: number | null, ageHours: number): LivePost["momentum"] {
  if (ageHours < 1) return "new";
  if (perHour == null) return "flat";
  if (perHour >= 100) return "surging";
  if (perHour >= 20) return "steady";
  if (perHour > 0) return "cooling";
  return "flat";
}

// Posts published within `windowDays`, ranked by current momentum so the team
// can see which post is pulling ahead right now.
export async function livePosts(windowDays = 7): Promise<LivePost[]> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const posts = await prisma.post.findMany({
    where: { publishedAt: { gte: since } },
    include: {
      campaign: true,
      metrics: { orderBy: { capturedAt: "desc" }, take: 2 },
    },
  });

  const now = Date.now();

  const live: LivePost[] = posts.map((p) => {
    const reach = p.reach ?? 0;
    const viewers = p.viewers ?? 0;
    const ageHours = p.publishedAt ? (now - p.publishedAt.getTime()) / 3_600_000 : 0;

    let viewsPerHour: number | null = null;
    let lastUpdated: Date | null = null;
    if (p.metrics.length >= 2) {
      const [recent, prev] = p.metrics;
      const hours = (recent.capturedAt.getTime() - prev.capturedAt.getTime()) / 3_600_000;
      if (hours > 0) {
        viewsPerHour = ((recent.viewers ?? 0) - (prev.viewers ?? 0)) / hours;
      }
      lastUpdated = recent.capturedAt;
    } else if (p.metrics.length === 1) {
      lastUpdated = p.metrics[0].capturedAt;
    }

    const viewsPerHourLifetime = ageHours > 0 ? viewers / ageHours : null;

    return {
      id: p.id,
      campaign: p.campaign.name,
      platform: p.platform,
      caption: p.caption,
      permalink: p.permalink,
      publishedAt: p.publishedAt,
      reach,
      viewers,
      engagement: engagementRate(p) ?? 0,
      viewsPerHour,
      viewsPerHourLifetime,
      lastUpdated,
      momentum: classifyMomentum(viewsPerHour ?? viewsPerHourLifetime, ageHours),
    };
  });

  // Rank: live momentum first, then lifetime pace as a fallback for posts
  // without two snapshots yet.
  return live.sort((a, b) => {
    const aRate = a.viewsPerHour ?? a.viewsPerHourLifetime ?? 0;
    const bRate = b.viewsPerHour ?? b.viewsPerHourLifetime ?? 0;
    return bRate - aRate;
  });
}

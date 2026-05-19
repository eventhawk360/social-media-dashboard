import { prisma } from "./db";
import { engagementRate } from "./scoring";

// Recompute alerts from current Post snapshots. Idempotent: clears prior open
// alerts and writes fresh ones based on percentile thresholds across the corpus.
export async function recomputeAlerts() {
  const posts = await prisma.post.findMany({
    where: { OR: [{ reach: { gt: 0 } }, { viewers: { gt: 0 } }] },
    include: { campaign: true },
  });

  if (posts.length === 0) return { created: 0 };

  const viewers = posts.map((p) => p.viewers ?? 0).sort((a, b) => a - b);
  const p90 = viewers[Math.floor(viewers.length * 0.9)];
  const p10 = viewers[Math.floor(viewers.length * 0.1)];

  await prisma.alert.deleteMany({ where: { resolvedAt: null } });

  const created = await prisma.alert.createMany({
    data: posts.flatMap((p) => {
      const out: { postId: string; campaignId: string; kind: string; message: string; severity: string }[] = [];
      const v = p.viewers ?? 0;
      const er = engagementRate(p);
      if (v >= p90 && p90 > 0) {
        out.push({
          postId: p.id,
          campaignId: p.campaignId,
          kind: "top_performer",
          severity: "info",
          message: `${p.campaign.name} on ${p.platform} hit ${v.toLocaleString()} views (top 10%) — double down on this format.`,
        });
      }
      if (v > 0 && v <= p10) {
        out.push({
          postId: p.id,
          campaignId: p.campaignId,
          kind: "underperformer",
          severity: "warn",
          message: `${p.campaign.name} on ${p.platform} only reached ${v.toLocaleString()} views (bottom 10%) — review hook/CTA or pause.`,
        });
      }
      if (er !== null && er < 0.3 && v > 200) {
        out.push({
          postId: p.id,
          campaignId: p.campaignId,
          kind: "low_engagement",
          severity: "warn",
          message: `${p.campaign.name} on ${p.platform} has low engagement (${(er * 100).toFixed(0)}% reach/views) despite ${v.toLocaleString()} views — caption or thumbnail is leaking attention.`,
        });
      }
      return out;
    }),
  });

  return { created: created.count };
}

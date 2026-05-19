// Meta Graph API ingestion for Facebook Pages + Instagram Business accounts.
// Pulls recent posts + insights (impressions, reach, engaged_users) and upserts
// MetricSnapshot rows keyed by externalId.
//
// Required env: META_ACCESS_TOKEN, META_FACEBOOK_PAGE_ID, META_INSTAGRAM_BUSINESS_ID
// Token must have pages_read_engagement + instagram_basic + instagram_manage_insights.

import { prisma } from "../db";
import { classifyPerformance } from "../scoring";

const GRAPH = "https://graph.facebook.com/v21.0";

type FbPostNode = {
  id: string;
  message?: string;
  permalink_url?: string;
  created_time: string;
  insights?: { data: { name: string; values: { value: number }[] }[] };
};

async function gget<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN is not set");
  const url = new URL(`${GRAPH}/${path}`);
  Object.entries({ ...params, access_token: token }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Meta API ${path} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

function pickMetric(node: FbPostNode, name: string): number | undefined {
  return node.insights?.data.find((d) => d.name === name)?.values[0]?.value;
}

export async function ingestFacebookPage() {
  const pageId = process.env.META_FACEBOOK_PAGE_ID;
  if (!pageId) return { skipped: true, reason: "META_FACEBOOK_PAGE_ID missing" };

  const data = await gget<{ data: FbPostNode[] }>(`${pageId}/posts`, {
    fields: "id,message,permalink_url,created_time,insights.metric(post_impressions,post_impressions_unique,post_engaged_users)",
    limit: "50",
  });

  let updated = 0;
  for (const p of data.data) {
    const reach = pickMetric(p, "post_impressions_unique");
    const viewers = pickMetric(p, "post_impressions");
    const post = await prisma.post.upsert({
      where: { platform_externalId: { platform: "facebook", externalId: p.id } },
      create: {
        platform: "facebook",
        externalId: p.id,
        permalink: p.permalink_url,
        caption: p.message,
        publishedAt: new Date(p.created_time),
        reach, viewers,
        performance: classifyPerformance(reach, viewers),
        campaign: {
          connectOrCreate: {
            where: { name: "Unassigned (FB ingest)" },
            create: { name: "Unassigned (FB ingest)", audience: "Party Rental Business Owners" },
          },
        },
      },
      update: {
        reach, viewers,
        performance: classifyPerformance(reach, viewers),
      },
    });
    await prisma.metricSnapshot.create({ data: { postId: post.id, reach, viewers } });
    updated++;
  }
  return { updated };
}

export async function ingestInstagram() {
  const igId = process.env.META_INSTAGRAM_BUSINESS_ID;
  if (!igId) return { skipped: true, reason: "META_INSTAGRAM_BUSINESS_ID missing" };

  const data = await gget<{ data: (FbPostNode & { caption?: string; media_type?: string })[] }>(
    `${igId}/media`,
    {
      fields: "id,caption,permalink,timestamp,media_type,insights.metric(reach,impressions,engagement)",
      limit: "50",
    },
  );

  let updated = 0;
  for (const m of data.data as any[]) {
    const reach = m.insights?.data.find((d: any) => d.name === "reach")?.values[0]?.value;
    const viewers = m.insights?.data.find((d: any) => d.name === "impressions")?.values[0]?.value;
    const post = await prisma.post.upsert({
      where: { platform_externalId: { platform: "instagram", externalId: m.id } },
      create: {
        platform: "instagram",
        externalId: m.id,
        permalink: m.permalink,
        caption: m.caption,
        publishedAt: m.timestamp ? new Date(m.timestamp) : undefined,
        reach, viewers,
        performance: classifyPerformance(reach, viewers),
        campaign: {
          connectOrCreate: {
            where: { name: "Unassigned (IG ingest)" },
            create: { name: "Unassigned (IG ingest)", audience: "Party Rental Business Owners" },
          },
        },
      },
      update: { reach, viewers, performance: classifyPerformance(reach, viewers) },
    });
    await prisma.metricSnapshot.create({ data: { postId: post.id, reach, viewers } });
    updated++;
  }
  return { updated };
}

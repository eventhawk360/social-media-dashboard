// TikTok Business API ingestion.
// Docs: https://business-api.tiktok.com/portal/docs?id=1739939600089601 (video list/insights)
// Requires an approved Business app and an access token bound to the advertiser/business id.

import { prisma } from "../db";
import { classifyPerformance } from "../scoring";

const BASE = "https://business-api.tiktok.com/open_api/v1.3";

export async function ingestTikTok() {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  const businessId = process.env.TIKTOK_BUSINESS_ID;
  if (!token || !businessId) return { skipped: true, reason: "TIKTOK_ACCESS_TOKEN / TIKTOK_BUSINESS_ID missing" };

  const url = new URL(`${BASE}/business/video/list/`);
  url.searchParams.set("business_id", businessId);
  url.searchParams.set("fields", JSON.stringify(["item_id","caption","create_time","video_views","reach","like_count","comment_count","share_count"]));

  const res = await fetch(url, { headers: { "Access-Token": token } });
  if (!res.ok) throw new Error(`TikTok API failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data?: { videos?: any[] } };

  let updated = 0;
  for (const v of data.data?.videos ?? []) {
    const reach = v.reach;
    const viewers = v.video_views;
    const post = await prisma.post.upsert({
      where: { platform_externalId: { platform: "tiktok", externalId: String(v.item_id) } },
      create: {
        platform: "tiktok",
        externalId: String(v.item_id),
        caption: v.caption,
        publishedAt: v.create_time ? new Date(v.create_time * 1000) : undefined,
        reach, viewers,
        performance: classifyPerformance(reach, viewers),
        campaign: {
          connectOrCreate: {
            where: { name: "Unassigned (TikTok ingest)" },
            create: { name: "Unassigned (TikTok ingest)", audience: "Party Rental Business Owners" },
          },
        },
      },
      update: { reach, viewers, performance: classifyPerformance(reach, viewers) },
    });
    await prisma.metricSnapshot.create({
      data: {
        postId: post.id,
        reach, viewers,
        likes: v.like_count,
        comments: v.comment_count,
        shares: v.share_count,
      },
    });
    updated++;
  }
  return { updated };
}

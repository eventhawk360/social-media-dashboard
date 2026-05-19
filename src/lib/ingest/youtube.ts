// YouTube Data API v3 ingestion.
// Pulls the channel's recent uploads + per-video statistics. For Shorts/Posts
// engagement metrics, the YouTube Analytics API is needed (OAuth scope yt-analytics.readonly).

import { prisma } from "../db";
import { classifyPerformance } from "../scoring";

export async function ingestYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!key || !channelId) return { skipped: true, reason: "YOUTUBE_API_KEY / YOUTUBE_CHANNEL_ID missing" };

  // Get uploads playlist id
  const chanRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${key}`,
  );
  if (!chanRes.ok) throw new Error(`YouTube channel fetch failed: ${chanRes.status}`);
  const chan = (await chanRes.json()) as any;
  const uploads = chan.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return { skipped: true, reason: "No uploads playlist" };

  const pl = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploads}&maxResults=50&key=${key}`,
  );
  const playlist = (await pl.json()) as any;
  const videoIds: string[] = (playlist.items ?? []).map((i: any) => i.contentDetails.videoId);
  if (videoIds.length === 0) return { updated: 0 };

  const stats = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${key}`,
  );
  const statsJson = (await stats.json()) as any;

  let updated = 0;
  for (const v of statsJson.items ?? []) {
    const viewers = Number(v.statistics?.viewCount ?? 0);
    // YouTube Data API does not expose reach directly; use viewers as proxy until
    // YouTube Analytics API is wired in.
    const reach = viewers;
    const post = await prisma.post.upsert({
      where: { platform_externalId: { platform: "youtube", externalId: v.id } },
      create: {
        platform: "youtube",
        externalId: v.id,
        permalink: `https://www.youtube.com/watch?v=${v.id}`,
        caption: v.snippet?.title,
        publishedAt: v.snippet?.publishedAt ? new Date(v.snippet.publishedAt) : undefined,
        reach, viewers,
        performance: classifyPerformance(reach, viewers),
        campaign: {
          connectOrCreate: {
            where: { name: "Unassigned (YouTube ingest)" },
            create: { name: "Unassigned (YouTube ingest)", audience: "Party Rental Business Owners" },
          },
        },
      },
      update: { reach, viewers, performance: classifyPerformance(reach, viewers) },
    });
    await prisma.metricSnapshot.create({
      data: {
        postId: post.id,
        reach, viewers,
        likes: Number(v.statistics?.likeCount ?? 0),
        comments: Number(v.statistics?.commentCount ?? 0),
      },
    });
    updated++;
  }
  return { updated };
}

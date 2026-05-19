import { NextResponse } from "next/server";
import { ingestFacebookPage, ingestInstagram } from "@/lib/ingest/meta";
import { ingestTikTok } from "@/lib/ingest/tiktok";
import { ingestYouTube } from "@/lib/ingest/youtube";
import { recomputeAlerts } from "@/lib/alerts";

// Cron entrypoint. Configure Vercel cron in vercel.json:
// { "crons": [{ "path": "/api/ingest", "schedule": "0 */6 * * *" }] }
export async function POST(req: Request) {
  const secret = req.headers.get("x-ingest-secret");
  if (process.env.INGEST_SECRET && secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = {
    facebook: await ingestFacebookPage().catch((e) => ({ error: String(e) })),
    instagram: await ingestInstagram().catch((e) => ({ error: String(e) })),
    tiktok: await ingestTikTok().catch((e) => ({ error: String(e) })),
    youtube: await ingestYouTube().catch((e) => ({ error: String(e) })),
    alerts: await recomputeAlerts(),
  };
  return NextResponse.json(results);
}

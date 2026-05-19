import { ingestFacebookPage, ingestInstagram } from "../src/lib/ingest/meta";
import { ingestTikTok } from "../src/lib/ingest/tiktok";
import { ingestYouTube } from "../src/lib/ingest/youtube";
import { recomputeAlerts } from "../src/lib/alerts";

async function main() {
  const results = {
    facebook: await ingestFacebookPage().catch((e) => ({ error: String(e) })),
    instagram: await ingestInstagram().catch((e) => ({ error: String(e) })),
    tiktok: await ingestTikTok().catch((e) => ({ error: String(e) })),
    youtube: await ingestYouTube().catch((e) => ({ error: String(e) })),
    alerts: await recomputeAlerts(),
  };
  console.log(JSON.stringify(results, null, 2));
}

main().then(() => process.exit(0));

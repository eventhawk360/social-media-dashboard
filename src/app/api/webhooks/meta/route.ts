import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { ingestFacebookPage, ingestInstagram } from "@/lib/ingest/meta";

// Meta (Facebook + Instagram) webhook receiver.
//
// Setup: in the Meta App dashboard, add a Webhooks product, subscribe the Page
// to the "feed" field and the IG account to "media"/"comments". Point the
// callback URL at https://<host>/api/webhooks/meta and use META_WEBHOOK_VERIFY_TOKEN
// as the verify token. Set META_APP_SECRET so payload signatures are checked.
//
// Meta does NOT push insight numbers — the webhook only tells us *something
// changed*. We respond by kicking an immediate metrics poll so the new post (and
// its first numbers) land on the dashboard within seconds instead of waiting
// for the next cron tick.

// --- Verification handshake (GET) ---
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

function verifySignature(raw: string, signature: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return true; // not configured — skip (dev only)
  if (!signature) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// --- Event receiver (POST) ---
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("bad signature", { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }

  // Log what changed so we have an audit trail of inbound events.
  const changes: string[] = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      changes.push(`${body.object}:${change.field}`);
    }
  }

  // Meta requires a 200 within a few seconds. Trigger the poll without blocking
  // the response — the new post and its metrics are upserted by the ingesters.
  void Promise.allSettled([ingestFacebookPage(), ingestInstagram()])
    .then(() =>
      prisma.alert.create({
        data: {
          kind: "webhook",
          severity: "info",
          message: `Meta webhook received (${changes.join(", ") || "no changes"}) — metrics poll triggered.`,
        },
      }),
    )
    .catch(() => {});

  return NextResponse.json({ received: true });
}

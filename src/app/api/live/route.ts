import { NextResponse } from "next/server";
import { livePosts } from "@/lib/live";

// Polled by the Live page client component for near-real-time updates.
export async function GET() {
  const posts = await livePosts(7);
  return NextResponse.json(
    { posts, fetchedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

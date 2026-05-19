import { NextResponse } from "next/server";
import { buildReport } from "@/lib/reports";

export async function POST(req: Request) {
  const secret = req.headers.get("x-ingest-secret");
  if (process.env.INGEST_SECRET && secret && secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") ?? "weekly") as "weekly" | "monthly";
  const report = await buildReport(kind);
  return NextResponse.json(report);
}

export async function GET(req: Request) {
  return POST(req);
}

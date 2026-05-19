import type { Performance, Post } from "@prisma/client";

// Engagement rate = (reach / viewers) treated as a baseline proxy when no explicit
// likes/comments/clicks are available. When metrics fill in, swap to (engagements / reach).
export function engagementRate(p: Pick<Post, "reach" | "viewers">): number | null {
  if (!p.viewers || p.viewers <= 0 || p.reach == null) return null;
  return p.reach / p.viewers;
}

// Map free-text "good/regular/bad/excellent" notes from the spreadsheet to enum.
export function parsePerformanceNote(raw: string | undefined | null): Performance | null {
  if (!raw) return null;
  const t = raw.toLowerCase();
  if (t.includes("excel")) return "excellent";
  if (t.includes("good")) return "good";
  if (t.includes("regular")) return "regular";
  if (t.includes("bad")) return "bad";
  return null;
}

// Threshold-based classifier used when ingesting fresh metrics from APIs.
// Tunable; defaults chosen from the patterns in the seed data.
export function classifyPerformance(
  reach: number | null | undefined,
  viewers: number | null | undefined,
): Performance {
  const r = reach ?? 0;
  const v = viewers ?? 0;
  const er = engagementRate({ reach: r, viewers: v }) ?? 0;
  if (v >= 10000 || (r >= 3000 && er >= 0.6)) return "excellent";
  if (v >= 1500 && er >= 0.5) return "good";
  if (v >= 400) return "regular";
  return "bad";
}

export function performanceRank(p: Performance | null | undefined): number {
  switch (p) {
    case "excellent": return 3;
    case "good": return 2;
    case "regular": return 1;
    case "bad": return 0;
    default: return -1;
  }
}

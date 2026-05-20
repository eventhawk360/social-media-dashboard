"use client";

import { useEffect, useState, useCallback } from "react";
import type { LivePost } from "@/lib/live";

const MOMENTUM_STYLE: Record<LivePost["momentum"], { label: string; cls: string }> = {
  surging: { label: "SURGING", cls: "bg-good/15 text-good" },
  steady: { label: "STEADY", cls: "bg-excellent/15 text-excellent" },
  cooling: { label: "COOLING", cls: "bg-regular/15 text-regular" },
  flat: { label: "FLAT", cls: "bg-bad/15 text-bad" },
  new: { label: "JUST POSTED", cls: "bg-slate-200 text-slate-700" },
};

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return Math.round(n).toLocaleString();
}

function ago(d: string | null) {
  if (!d) return "never";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function LiveFeed({ initial }: { initial: LivePost[] }) {
  const [posts, setPosts] = useState<LivePost[]>(initial);
  const [fetchedAt, setFetchedAt] = useState<string>(new Date().toISOString());
  const [auto, setAuto] = useState(true);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const data = await res.json();
      setPosts(data.posts);
      setFetchedAt(data.fetchedAt);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [auto, refresh]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${auto ? "bg-good animate-pulse" : "bg-slate-400"}`} />
          <span className="text-slate-600">
            {auto ? "Live — refreshing every 30s" : "Auto-refresh paused"} · updated {ago(fetchedAt)}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading}
            className="rounded border px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50">
            {loading ? "Refreshing…" : "Refresh now"}
          </button>
          <button onClick={() => setAuto((a) => !a)}
            className="rounded border px-3 py-1 text-xs hover:bg-slate-50">
            {auto ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-sm text-slate-500">
          No posts published in the last 7 days. New posts appear here automatically once the
          Meta webhook fires or the next ingest poll runs.
        </p>
      ) : (
        <ol className="space-y-2">
          {posts.map((p, i) => {
            const m = MOMENTUM_STYLE[p.momentum];
            const rate = p.viewsPerHour ?? p.viewsPerHourLifetime;
            return (
              <li key={p.id} className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
                <span className="w-6 text-center text-lg font-semibold text-slate-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.campaign}</span>
                    <span className="text-xs uppercase text-slate-500">{p.platform}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${m.cls}`}>{m.label}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{p.caption ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{fmt(rate)} <span className="font-normal text-slate-500">views/hr</span></p>
                  <p className="text-xs text-slate-500">{fmt(p.viewers)} views · {fmt(p.reach)} reach</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

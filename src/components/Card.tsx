import type { ReactNode } from "react";

export function Card({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      {title && (
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function PerformanceBadge({ value }: { value: string | null | undefined }) {
  const map: Record<string, string> = {
    excellent: "bg-excellent/10 text-excellent",
    good: "bg-good/10 text-good",
    regular: "bg-regular/10 text-regular",
    bad: "bg-bad/10 text-bad",
  };
  if (!value) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${map[value] ?? "bg-slate-100 text-slate-600"}`}>
      {value}
    </span>
  );
}

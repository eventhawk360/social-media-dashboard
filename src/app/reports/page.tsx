import { Card } from "@/components/Card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({ orderBy: { periodEnd: "desc" }, take: 20 });

  return (
    <div className="space-y-6">
      <Card title="Generated reports" action={<span className="text-xs text-slate-500">POST /api/reports/generate?kind=weekly</span>}>
        {reports.length === 0 ? (
          <p className="text-sm text-slate-500">
            No reports yet. Trigger one with: <code className="rounded bg-slate-100 px-1">curl -X POST /api/reports/generate?kind=weekly</code>
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded border p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{r.kind} · {r.periodStart.toISOString().slice(0, 10)} → {r.periodEnd.toISOString().slice(0, 10)}</span>
                  <span className="text-slate-500">{r.createdAt.toISOString().slice(0, 10)}</span>
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{r.summary}</pre>
                {Array.isArray((r.payload as any)?.recommendations) && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold uppercase text-slate-500">Recommendations</p>
                    <ul className="ml-4 list-disc text-sm">
                      {(r.payload as any).recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

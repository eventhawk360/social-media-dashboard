import { Card } from "@/components/Card";
import { prisma } from "@/lib/db";
import { recomputeAlerts } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  await recomputeAlerts();
  const alerts = await prisma.alert.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <Card title={`Open alerts (${alerts.length})`}>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing flagged. Seed data may be too small or thresholds need tuning in <code>src/lib/alerts.ts</code>.</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded border p-3">
                <span className={`mt-0.5 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  a.severity === "critical" ? "bg-bad/10 text-bad" :
                  a.severity === "warn" ? "bg-regular/10 text-regular" : "bg-excellent/10 text-excellent"
                }`}>{a.kind}</span>
                <p className="text-sm">{a.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

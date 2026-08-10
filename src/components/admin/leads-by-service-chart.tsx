import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export type LeadsByService = {
  serviceName: string;
  count: number;
};

const PALETTE = [
  "bg-navy",
  "bg-gold-600",
  "bg-navy-500",
  "bg-gold-400",
  "bg-navy-400",
  "bg-gold-200",
  "bg-navy-100",
];

/**
 * Horizontal bar chart showing leads grouped by service.
 * Pure CSS bars — no chart library.
 */
export function LeadsByServiceChart({ data }: { data: LeadsByService[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-ink">
            Leads per Layanan
          </CardTitle>
          <p className="text-xs text-ink-soft mt-1">
            {total} total lead · {data.length} layanan
          </p>
        </div>
        <div className="inline-flex items-center justify-center size-9 rounded-lg bg-navy-50 text-navy">
          <Briefcase className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 || total === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-ink-soft">
            Belum ada lead dengan layanan terkait.
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((d, i) => {
              const widthPct = (d.count / max) * 100;
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <div key={d.serviceName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink truncate pr-2">
                      {d.serviceName}
                    </span>
                    <span className="shrink-0 tabular-nums text-ink-soft">
                      {d.count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-alt">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${PALETTE[i % PALETTE.length]}`}
                      style={{ width: `${Math.max(widthPct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

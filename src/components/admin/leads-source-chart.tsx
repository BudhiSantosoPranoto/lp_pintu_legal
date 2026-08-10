import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

export type LeadsBySource = {
  source: string;
  count: number;
};

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  WHATSAPP: "WhatsApp",
  NEWSLETTER: "Newsletter",
  ADMIN: "Admin",
};

const SOURCE_COLORS: Record<string, string> = {
  WEBSITE: "#0F2747",
  WHATSAPP: "#25D366",
  NEWSLETTER: "#C89B3C",
  ADMIN: "#64748B",
};

type Segment = LeadsBySource & {
  pct: number;
  startPct: number;
  endPct: number;
  color: string;
  label: string;
};

/**
 * Donut chart showing lead sources breakdown.
 * Pure SVG — no chart library.
 */
export function LeadsSourceChart({ data }: { data: LeadsBySource[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Build donut segments inside a memoised fold so we don't reassign a
  // render-scope variable (which trips the React Compiler immutability rule).
  const segments = React.useMemo<Segment[]>(() => {
    const out: Segment[] = [];
    let cumulativePct = 0;
    for (const d of data) {
      const pct = total > 0 ? (d.count / total) * 100 : 0;
      out.push({
        ...d,
        pct,
        startPct: cumulativePct,
        endPct: cumulativePct + pct,
        color: SOURCE_COLORS[d.source] ?? "#94A3B8",
        label: SOURCE_LABELS[d.source] ?? d.source,
      });
      cumulativePct += pct;
    }
    return out;
  }, [data, total]);

  // SVG donut math
  const radius = 70;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  const center = 100;

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-ink">
            Sumber Leads
          </CardTitle>
          <p className="text-xs text-ink-soft mt-1">
            {total} total lead · {data.length} sumber
          </p>
        </div>
        <div className="inline-flex items-center justify-center size-9 rounded-lg bg-gold-50 text-gold-600">
          <PieChartIcon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-ink-soft">
            Belum ada lead dengan sumber tercatat.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* Donut chart */}
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />
                {/* Segments */}
                {segments.map((seg, i) => {
                  const dashLength = (seg.pct / 100) * circumference;
                  const dashOffset = -(seg.startPct / 100) * circumference;
                  return (
                    <circle
                      key={seg.source}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="butt"
                      style={{
                        transition: "stroke-dasharray 0.7s ease, stroke-dashoffset 0.7s ease",
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  );
                })}
              </svg>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-navy tabular-nums">{total}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-ink-soft">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2.5 sm:w-40">
              {segments.map((seg) => (
                <div key={seg.source} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: seg.color }}
                      aria-hidden
                    />
                    <span className="truncate text-xs font-medium text-ink">
                      {seg.label}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-navy tabular-nums">
                    {seg.count} · {Math.round(seg.pct)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

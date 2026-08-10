import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export type LeadsByDay = {
  date: string; // ISO date string (YYYY-MM-DD)
  label: string; // short label (e.g. "Sen", "9")
  count: number;
};

/**
 * Simple SVG bar chart showing leads over the last 14 days.
 * No external chart library — pure SVG for minimal bundle.
 */
export function LeadsChart({ data }: { data: LeadsByDay[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-ink">
            Leads 14 Hari Terakhir
          </CardTitle>
          <p className="text-xs text-ink-soft mt-1">
            Total {total} lead dalam periode ini
          </p>
        </div>
        <div className="inline-flex items-center justify-center size-9 rounded-lg bg-gold-50 text-gold-600">
          <TrendingUp className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-ink-soft">
            Belum ada lead dalam 14 hari terakhir.
          </div>
        ) : (
          <div className="flex h-[180px] items-end gap-1.5">
            {data.map((d, i) => {
              const heightPct = (d.count / max) * 100;
              return (
                <div
                  key={d.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                >
                  {/* Tooltip */}
                  {d.count > 0 && (
                    <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-navy px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-soft transition-opacity group-hover:opacity-100 whitespace-nowrap">
                      {d.count} lead · {d.label}
                    </div>
                  )}
                  {/* Bar */}
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-navy to-navy-400 transition-all duration-500 group-hover:from-gold-600 group-hover:to-gold-400"
                    style={{
                      height: `${Math.max(heightPct, d.count > 0 ? 8 : 0)}%`,
                      minHeight: d.count > 0 ? "6px" : "0",
                      animationDelay: `${i * 40}ms`,
                    }}
                  />
                  {/* Label */}
                  <span className="mt-1.5 text-[9px] font-medium text-ink-soft">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

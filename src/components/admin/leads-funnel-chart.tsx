import * as React from "react";
import { ArrowDown, Filter, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type LeadStatusCounts = Record<string, number>;

type StageKey = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED";

type Stage = {
  key: StageKey;
  label: string;
  /** Background colour — navy→gold gradient across the funnel. */
  color: string;
  /** Foreground colour for the in-bar count text. */
  textColor: string;
  count: number;
};

const STAGE_META: {
  key: StageKey;
  label: string;
  color: string;
  textColor: string;
}[] = [
  {
    key: "NEW",
    label: "Baru",
    color: "#0F2747", // darkest navy
    textColor: "#FFFFFF",
  },
  {
    key: "CONTACTED",
    label: "Dihubungi",
    color: "#274B7E", // navy-500
    textColor: "#FFFFFF",
  },
  {
    key: "QUALIFIED",
    label: "Qualified",
    color: "#D8B25C", // gold-400
    textColor: "#0F2747",
  },
  {
    key: "CONVERTED",
    label: "Terkonversi",
    color: "#C89B3C", // gold
    textColor: "#0F2747",
  },
];

/**
 * Conversion funnel chart for the admin dashboard.
 *
 * Renders each of the four funnel stages (NEW → CONTACTED → QUALIFIED →
 * CONVERTED) as a horizontal trapezoid bar whose width is proportional to
 * the lead count at that stage. Conversion rate between adjacent stages is
 * shown as a small label between bars.
 *
 * LOST leads are intentionally not part of the funnel (they dropped out of
 * the pipeline) and are surfaced as a separate stat card below the chart.
 *
 * Pure HTML/CSS — no chart library. The trapezoid shape is achieved with a
 * `clip-path` polygon on each bar so the right edge angles inward.
 */
export function LeadsFunnelChart({
  statusCounts,
}: {
  statusCounts: LeadStatusCounts;
}) {
  const stages: Stage[] = STAGE_META.map((s) => ({
    ...s,
    count: statusCounts[s.key] ?? 0,
  }));

  const funnelTotal = stages.reduce((sum, s) => sum + s.count, 0);
  const lostCount = statusCounts["LOST"] ?? 0;
  const grandTotal = funnelTotal + lostCount;

  // Widest bar = the stage with the most leads. Every other bar is scaled
  // relative to that so the visual funnel shape directly reflects the stage
  // distribution. Memoised so we don't recompute on every parent re-render.
  const maxCount = React.useMemo(() => {
    const counts = stages.map((s) => s.count);
    return Math.max(...counts, 1);
    // stages is derived from statusCounts at render time; depending on it
    // directly would recompute every render which is fine but we keep the
    // memo for clarity.
  }, [statusCounts]);

  return (
    <Card className="shadow-soft h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-ink">
            Funnel Konversi Lead
          </CardTitle>
          <p className="text-xs text-ink-soft mt-1">
            Distribusi lead berdasarkan tahap konversi
          </p>
        </div>
        <div className="inline-flex items-center justify-center size-9 rounded-lg bg-gold-50 text-gold-600">
          <Filter className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {grandTotal === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-ink-soft">
            Belum ada data lead.
          </div>
        ) : (
          <div className="space-y-2">
            {stages.map((stage, i) => {
              const widthPct = (stage.count / maxCount) * 100;
              const pctOfFunnel =
                funnelTotal > 0 ? (stage.count / funnelTotal) * 100 : 0;
              const prevStage = i > 0 ? stages[i - 1] : null;
              const convRate =
                prevStage && prevStage.count > 0
                  ? Math.round((stage.count / prevStage.count) * 100)
                  : null;

              return (
                <div key={stage.key}>
                  {convRate !== null && (
                    <div
                      className="flex items-center justify-center gap-1 text-[11px] font-medium text-ink-soft tabular-nums py-1"
                      aria-label={`Konversi dari ${prevStage?.label} ke ${stage.label}: ${convRate}%`}
                    >
                      <ArrowDown className="size-3 text-gold-600" />
                      <span>
                        {convRate}% konversi ·{" "}
                        <span className="text-ink-soft/80">
                          {prevStage && prevStage.count - stage.count > 0
                            ? `${prevStage.count - stage.count} lead tidak lanjut`
                            : "semua lead melanjutkan"}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {/* Stage label */}
                    <div className="w-20 sm:w-24 shrink-0 text-xs font-medium text-ink-soft text-right">
                      {stage.label}
                    </div>
                    {/* Trapezoid bar */}
                    <div className="flex-1 relative h-10">
                      <div
                        className="absolute inset-y-0 left-0 flex items-center justify-end pr-3 transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(widthPct, stage.count > 0 ? 14 : 0)}%`,
                          background: stage.color,
                          clipPath:
                            "polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
                          minWidth: stage.count > 0 ? "60px" : "0",
                        }}
                        role="img"
                        aria-label={`${stage.label}: ${stage.count} lead, ${Math.round(pctOfFunnel)}% dari funnel`}
                      >
                        {stage.count > 0 && (
                          <span
                            className="text-xs font-semibold tabular-nums"
                            style={{ color: stage.textColor }}
                          >
                            {stage.count} · {Math.round(pctOfFunnel)}%
                          </span>
                        )}
                      </div>
                      {stage.count === 0 && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-ink-soft/60">
                          0 lead
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* LOST leads stat */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-between rounded-lg bg-red-50/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center justify-center size-7 rounded-md bg-red-100 text-red-600">
                    <TrendingDown className="size-3.5" />
                  </div>
                  <span className="text-xs font-medium text-ink">
                    Lead Hilang
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-700 tabular-nums">
                    {lostCount} lead
                  </div>
                  <div className="text-[10px] text-ink-soft tabular-nums">
                    {grandTotal > 0
                      ? `${Math.round((lostCount / grandTotal) * 100)}% dari total`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-ink-soft">
              Funnel menampilkan {funnelTotal} lead aktif dari total{" "}
              {grandTotal} lead tersimpan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

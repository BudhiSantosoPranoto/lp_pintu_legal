"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export type LeadSourceKey = "WEBSITE" | "WHATSAPP" | "NEWSLETTER";

export type LeadsSourceTrendPoint = {
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  /** Short human label, e.g. "Sen 9". */
  label: string;
  /** Per-source count for this day. Missing keys default to 0. */
  counts: Partial<Record<LeadSourceKey, number>>;
};

const SOURCES: {
  key: LeadSourceKey;
  label: string;
  color: string;
}[] = [
  { key: "WEBSITE", label: "Website", color: "#0F2747" }, // navy
  { key: "WHATSAPP", label: "WhatsApp", color: "#25D366" }, // whatsapp green
  { key: "NEWSLETTER", label: "Newsletter", color: "#C89B3C" }, // gold
];

// ─── SVG layout constants ────────────────────────────────────────────────────
const VIEW_W = 640;
const VIEW_H = 280;
const PAD = { top: 20, right: 16, bottom: 36, left: 36 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

/**
 * Convert an array of points into a smooth SVG path using a Catmull-Rom →
 * cubic-bezier conversion. Produces a single `M … C … C … …` path that
 * passes smoothly through every point.
 */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    // Catmull-Rom → Bézier control points (tension 0.5).
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Pure-SVG line chart showing lead volume per source over the last 14 days.
 *
 * Renders three smooth curved lines (Website / WhatsApp / Newsletter), subtle
 * horizontal grid lines, an X-axis of day labels, and a Y-axis of integer
 * ticks. Hovering anywhere over the plot area snaps a vertical guide line +
 * per-source dots to the nearest day and shows a tooltip with that day's
 * counts.
 *
 * All visual primitives are SVG — no chart library — so the bundle stays
 * tiny and the styling matches the rest of the admin dashboard exactly.
 */
export function LeadsSourceTrendChart({
  data,
}: {
  data: LeadsSourceTrendPoint[];
}) {
  // Compute the global max across all sources so all three lines share a
  // common Y scale. Memoised so we don't recompute on every mouse-move.
  const maxValue = React.useMemo(() => {
    let m = 0;
    for (const p of data) {
      for (const s of SOURCES) {
        m = Math.max(m, p.counts[s.key] ?? 0);
      }
    }
    // Round up to the nearest "nice" tick (1, 2, 5, 10, 20, 50, …).
    if (m <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(m)));
    const n = m / pow;
    let nice: number;
    if (n <= 1) nice = 1;
    else if (n <= 2) nice = 2;
    else if (n <= 5) nice = 5;
    else nice = 10;
    return nice * pow;
  }, [data]);

  const totalLeads = React.useMemo(() => {
    let t = 0;
    for (const p of data) {
      for (const s of SOURCES) t += p.counts[s.key] ?? 0;
    }
    return t;
  }, [data]);

  // Per-source series, pre-computed as `{ x, y }` plot coordinates.
  const series = React.useMemo(() => {
    return SOURCES.map((s) => {
      const points = data.map((p, i) => {
        const value = p.counts[s.key] ?? 0;
        const x = PAD.left + (data.length === 1 ? PLOT_W / 2 : (i / (data.length - 1)) * PLOT_W);
        const y = PAD.top + PLOT_H - (value / maxValue) * PLOT_H;
        return { x, y, value };
      });
      return { ...s, points };
    });
  }, [data, maxValue]);

  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (data.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // Convert mouse X to viewBox coordinates.
    const ratio = VIEW_W / rect.width;
    const localX = (e.clientX - rect.left) * ratio;
    const relX = localX - PAD.left;
    // Snap to the nearest data point index.
    const idx = Math.round((relX / PLOT_W) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }

  function handleLeave() {
    setHoverIdx(null);
  }

  // Y-axis ticks (0, 25%, 50%, 75%, 100%).
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: Math.round(maxValue * f),
    y: PAD.top + PLOT_H - f * PLOT_H,
  }));

  return (
    <Card className="shadow-soft h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-ink">
            Tren Sumber Leads
          </CardTitle>
          <p className="text-xs text-ink-soft mt-1">
            14 hari terakhir · {totalLeads} lead
          </p>
        </div>
        <div className="inline-flex items-center justify-center size-9 rounded-lg bg-gold-50 text-gold-600">
          <TrendingUp className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {totalLeads === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-ink-soft">
            Belum ada data lead.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {SOURCES.map((s) => {
                const seriesTotal = data.reduce(
                  (sum, p) => sum + (p.counts[s.key] ?? 0),
                  0
                );
                return (
                  <div
                    key={s.key}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                      aria-hidden
                    />
                    <span className="text-xs font-medium text-ink">
                      {s.label}
                    </span>
                    <span className="text-[11px] text-ink-soft tabular-nums">
                      ({seriesTotal})
                    </span>
                  </div>
                );
              })}
            </div>

            {/* SVG chart */}
            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="w-full h-auto"
                role="img"
                aria-label={`Tren sumber leads 14 hari terakhir. Total ${totalLeads} lead.`}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
              >
                {/* Horizontal grid lines + Y-axis tick labels */}
                {yTicks.map((t, i) => (
                  <g key={i}>
                    <line
                      x1={PAD.left}
                      y1={t.y}
                      x2={PAD.left + PLOT_W}
                      y2={t.y}
                      stroke="#E2E8F0"
                      strokeWidth={1}
                      strokeDasharray={t.value === 0 ? "0" : "3 3"}
                    />
                    <text
                      x={PAD.left - 6}
                      y={t.y + 3}
                      textAnchor="end"
                      fontSize={9}
                      fill="#64748B"
                      className="tabular-nums"
                    >
                      {t.value}
                    </text>
                  </g>
                ))}

                {/* X-axis baseline */}
                <line
                  x1={PAD.left}
                  y1={PAD.top + PLOT_H}
                  x2={PAD.left + PLOT_W}
                  y2={PAD.top + PLOT_H}
                  stroke="#CBD5E1"
                  strokeWidth={1}
                />

                {/* X-axis labels (every other day to avoid crowding) */}
                {data.map((p, i) => {
                  // Always show first + last; otherwise show every other.
                  if (i !== 0 && i !== data.length - 1 && i % 2 !== 0) return null;
                  const x =
                    PAD.left +
                    (data.length === 1
                      ? PLOT_W / 2
                      : (i / (data.length - 1)) * PLOT_W);
                  return (
                    <text
                      key={p.date}
                      x={x}
                      y={PAD.top + PLOT_H + 16}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#64748B"
                    >
                      {p.label}
                    </text>
                  );
                })}

                {/* Per-source smooth paths + dots */}
                {series.map((s) => (
                  <g key={s.key}>
                    <path
                      d={smoothPath(s.points)}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Per-point dots */}
                    {s.points.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoverIdx === i ? 4 : 2.5}
                        fill="#FFFFFF"
                        stroke={s.color}
                        strokeWidth={2}
                        style={{
                          transition: "r 120ms ease-out",
                        }}
                      />
                    ))}
                  </g>
                ))}

                {/* Hover guide line + dots */}
                {hoverIdx !== null && data[hoverIdx] && (
                  <g pointerEvents="none">
                    <line
                      x1={
                        PAD.left +
                        (data.length === 1
                          ? PLOT_W / 2
                          : (hoverIdx / (data.length - 1)) * PLOT_W)
                      }
                      y1={PAD.top}
                      x2={
                        PAD.left +
                        (data.length === 1
                          ? PLOT_W / 2
                          : (hoverIdx / (data.length - 1)) * PLOT_W)
                      }
                      y2={PAD.top + PLOT_H}
                      stroke="#0F2747"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      opacity={0.35}
                    />
                  </g>
                )}
              </svg>

              {/* Tooltip (HTML overlay for crisper text + easier layout). */}
              {hoverIdx !== null && data[hoverIdx] && (
                <div
                  className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-0 rounded-md bg-navy px-3 py-2 shadow-soft-lg text-white text-[11px] whitespace-nowrap"
                  style={{
                    left: `${
                      ((PAD.left +
                        (data.length === 1
                          ? PLOT_W / 2
                          : (hoverIdx / (data.length - 1)) * PLOT_W)) /
                        VIEW_W) *
                      100
                    }%`,
                    top: 0,
                  }}
                >
                  <div className="font-semibold mb-1">
                    {data[hoverIdx].label}
                  </div>
                  <div className="space-y-0.5">
                    {SOURCES.map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center gap-1.5 tabular-nums"
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                          aria-hidden
                        />
                        <span className="text-white/70">{s.label}</span>
                        <span className="ml-auto font-semibold">
                          {data[hoverIdx].counts[s.key] ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Gauge } from "lucide-react";
import { db } from "@/lib/db";

const METRIC_LABELS: Record<string, string> = {
  LCP: "Largest Contentful Paint",
  CLS: "Cumulative Layout Shift",
  INP: "Interaction to Next Paint",
  TTFB: "Time to First Byte",
  FID: "First Input Delay",
};

const METRIC_THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
  LCP: { good: 2500, poor: 4000, unit: "ms" },
  CLS: { good: 0.1, poor: 0.25, unit: "" },
  INP: { good: 200, poor: 500, unit: "ms" },
  TTFB: { good: 800, poor: 1800, unit: "ms" },
  FID: { good: 100, poor: 300, unit: "ms" },
};

function formatValue(name: string, value: number): string {
  const t = METRIC_THRESHOLDS[name];
  if (!t) return value.toFixed(1);
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)}${t.unit}`;
}

function getRatingColor(rating: string): string {
  if (rating === "good") return "text-emerald-600 bg-emerald-50 ring-emerald-200";
  if (rating === "needs-improvement") return "text-amber-600 bg-amber-50 ring-amber-200";
  return "text-red-600 bg-red-50 ring-red-200";
}

/**
 * Displays Web Vitals analytics on the admin settings page.
 */
export async function WebVitalsAnalytics() {
  let analytics = { metrics: {}, totalReports: 0, lastUpdated: 0 };

  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "web_vitals_analytics" },
    });
    if (setting?.value) {
      analytics = JSON.parse(setting.value);
    }
  } catch {
    // DB not available
  }

  const metrics = analytics.metrics as Record<string, { count: number; avgValue: number; good: number; poor: number }> || {};
  const totalReports = analytics.totalReports ?? 0;

  if (totalReports === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-ink">
                Web Vitals
              </CardTitle>
              <p className="text-xs text-ink-soft mt-1">
                Metrik performa situs (LCP, CLS, INP, TTFB)
              </p>
            </div>
            <div className="inline-flex items-center justify-center size-9 rounded-lg bg-navy-50 text-navy">
              <Activity className="size-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[120px] items-center justify-center text-sm text-ink-soft">
            Belum ada data Web Vitals. Kunjungi situs untuk memulai pelacakan.
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricNames = Object.keys(metrics).filter((k) => METRIC_LABELS[k]);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-ink">
              Web Vitals
            </CardTitle>
            <p className="text-xs text-ink-soft mt-1">
              {totalReports} laporan · {metricNames.length} metrik dilacak
            </p>
          </div>
          <div className="inline-flex items-center justify-center size-9 rounded-lg bg-navy-50 text-navy">
            <Activity className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metricNames.map((name) => {
          const m = metrics[name];
          if (!m || m.count === 0) return null;
          const avg = m.avgValue ?? 0;
          const t = METRIC_THRESHOLDS[name];
          const rating = t
            ? avg <= t.good
              ? "good"
              : avg <= t.poor
                ? "needs-improvement"
                : "poor"
            : "good";
          const goodPct = m.count > 0 ? Math.round((m.good / m.count) * 100) : 0;

          return (
            <div key={name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gauge className="size-3.5 text-ink-soft" />
                  <span className="font-medium text-ink">{METRIC_LABELS[name]}</span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${getRatingColor(rating)}`}>
                  {formatValue(name, avg)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-alt">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rating === "good" ? "bg-emerald-500" : rating === "needs-improvement" ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.max(goodPct, 2)}%` }}
                  />
                </div>
                <span className="text-[10px] text-ink-soft tabular-nums">
                  {m.count}x · {goodPct}% good
                </span>
              </div>
            </div>
          );
        })}
        {metricNames.length === 0 && (
          <div className="flex h-[80px] items-center justify-center text-sm text-ink-soft">
            Menunggu data metrik...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

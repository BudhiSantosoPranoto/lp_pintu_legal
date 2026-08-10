import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";

/**
 * Displays cookie consent choice analytics on the admin settings page.
 * Shows counts and percentages for each consent choice.
 */
export async function CookieConsentAnalytics() {
  let analytics = { all: 0, necessary: 0, dismissed: 0, total: 0 };

  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "cookie_consent_analytics" },
    });
    if (setting?.value) {
      analytics = JSON.parse(setting.value);
    }
  } catch {
    // DB not available
  }

  const total = analytics.total ?? 0;
  if (total === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-ink">
                Analitik Cookie Consent
              </CardTitle>
              <p className="text-xs text-ink-soft mt-1">
                Pilihan pengunjung terkait cookie
              </p>
            </div>
            <div className="inline-flex items-center justify-center size-9 rounded-lg bg-gold-50 text-gold-600">
              <Cookie className="size-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[120px] items-center justify-center text-sm text-ink-soft">
            Belum ada data consent tercatat.
          </div>
        </CardContent>
      </Card>
    );
  }

  const choices = [
    { key: "all", label: "Terima Semua", color: "bg-navy", count: analytics.all ?? 0 },
    { key: "necessary", label: "Hanya Penting", color: "bg-gold-600", count: analytics.necessary ?? 0 },
    { key: "dismissed", label: "Tutup Sementara", color: "bg-slate-400", count: analytics.dismissed ?? 0 },
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-ink">
              Analitik Cookie Consent
            </CardTitle>
            <p className="text-xs text-ink-soft mt-1">
              {total} total respons · pilihan pengunjung
            </p>
          </div>
          <div className="inline-flex items-center justify-center size-9 rounded-lg bg-gold-50 text-gold-600">
            <Cookie className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {choices.map((c) => {
          const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
          return (
            <div key={c.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`size-3 rounded-sm ${c.color}`} aria-hidden />
                  <span className="font-medium text-ink">{c.label}</span>
                </div>
                <span className="text-ink-soft tabular-nums">
                  {c.count} · {pct}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-alt">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${c.color}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface-alt p-3 text-xs text-ink-soft">
          <TrendingUp className="size-3.5 text-gold-600 shrink-0" />
          <span>
            Tingkat penerimaan:{" "}
            <span className="font-semibold text-navy">
              {total > 0 ? Math.round(((analytics.all ?? 0) / total) * 100) : 0}%
            </span>{" "}
            pengunjung menerima semua cookie.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

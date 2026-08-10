import Link from "next/link";
import {
  Inbox,
  Briefcase,
  Newspaper,
  Users,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  AlertTriangle,
  Star,
  Gauge,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LEAD_STATUS, leadStatusBadgeClass } from "@/components/admin/lead-status";
import {
  LeadsChart,
  type LeadsByDay,
} from "@/components/admin/leads-chart";
import {
  LeadsByServiceChart,
  type LeadsByService,
} from "@/components/admin/leads-by-service-chart";
import {
  LeadsSourceChart,
  type LeadsBySource,
} from "@/components/admin/leads-source-chart";
import {
  LeadsFunnelChart,
  type LeadStatusCounts,
} from "@/components/admin/leads-funnel-chart";
import {
  LeadsSourceTrendChart,
  type LeadsSourceTrendPoint,
  type LeadSourceKey,
} from "@/components/admin/leads-source-trend-chart";
import {
  calculateLeadScore,
  summarizeLeadScores,
  type LeadScoreTier,
} from "@/lib/lead-scoring";

export const dynamic = "force-dynamic";

function weekAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

function fourteenDaysAgo(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 13);
  return d;
}

/** Leads are "stale" if they have been NEW or CONTACTED for >48h since
 *  their last update. Returns the cutoff Date (now - 48h). */
function staleCutoff(): Date {
  const d = new Date();
  d.setTime(d.getTime() - 48 * 60 * 60 * 1000);
  return d;
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default async function AdminDashboardPage() {
  const [
    totalLeads,
    newLeadsThisWeek,
    totalServices,
    publishedPosts,
    recentLeads,
    totalTestimonials,
    leadsLast14Days,
    leadsByServiceRaw,
    leadsBySourceRaw,
    staleLeadsCount,
    leadsByStatusRaw,
    leadsSourceTrendRaw,
    leadsForScoring,
  ] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: "NEW", createdAt: { gte: weekAgo() } } }),
    db.service.count(),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { service: { select: { name: true, slug: true } } },
    }),
    db.testimonial.count({ where: { isActive: true } }),
    db.lead.findMany({
      where: { createdAt: { gte: fourteenDaysAgo() } },
      select: { createdAt: true, serviceId: true, service: { select: { name: true } } },
    }),
    db.lead.groupBy({
      by: ["serviceId"],
      _count: { _all: true },
      where: { serviceId: { not: null } },
    }),
    db.lead.groupBy({
      by: ["source"],
      _count: { _all: true },
    }),
    // Stale leads: NEW or CONTACTED, not updated in >48h.
    db.lead.count({
      where: {
        status: { in: ["NEW", "CONTACTED"] },
        updatedAt: { lt: staleCutoff() },
      },
    }),
    // Status distribution across ALL leads (for the conversion funnel).
    db.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    // 14-day lead-source trend — only createdAt + source, grouped client-side.
    db.lead.findMany({
      where: { createdAt: { gte: fourteenDaysAgo() } },
      select: { createdAt: true, source: true },
    }),
    // ─── Lead scoring distribution ──────────────────────────────────────────
    // Fetch only the fields needed by `calculateLeadScore`. Selecting a
    // minimal projection keeps this query cheap even with thousands of leads.
    db.lead.findMany({
      select: {
        id: true,
        email: true,
        businessName: true,
        serviceId: true,
        message: true,
        source: true,
        status: true,
      },
    }),
  ]);

  // Build leads-per-day chart data (last 14 days)
  const dayMap = new Map<string, number>();
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const lead of leadsLast14Days) {
    const key = lead.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
  }
  const leadsByDay: LeadsByDay[] = Array.from(dayMap.entries()).map(([date, count]) => {
    const d = new Date(date + "T00:00:00");
    return {
      date,
      label: `${DAY_LABELS[d.getDay()]} ${d.getDate()}`,
      count,
    };
  });

  // Build leads-by-service chart data
  const serviceNames = await db.service.findMany({
    select: { id: true, name: true },
  });
  const serviceNameMap = new Map(serviceNames.map((s) => [s.id, s.name]));
  const leadsByService: LeadsByService[] = leadsByServiceRaw
    .map((item) => ({
      serviceName: serviceNameMap.get(item.serviceId!) ?? "Tidak diketahui",
      count: item._count._all,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Build leads-by-source chart data
  const leadsBySource: LeadsBySource[] = leadsBySourceRaw
    .map((item) => ({
      source: item.source,
      count: item._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  // Build 14-day lead-source trend data.
  // Initialise a 14-entry map keyed by `YYYY-MM-DD`, each entry holding a
  // per-source count dict. Then walk every recent lead and increment.
  const trendDayMap = new Map<
    string,
    Record<LeadSourceKey, number>
  >();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trendDayMap.set(key, { WEBSITE: 0, WHATSAPP: 0, NEWSLETTER: 0 });
  }
  for (const lead of leadsSourceTrendRaw) {
    const key = lead.createdAt.toISOString().slice(0, 10);
    const entry = trendDayMap.get(key);
    if (!entry) continue;
    // Only track the three primary public sources; "ADMIN" leads (created
    // from inside the admin console) are intentionally excluded from the
    // trend chart so it stays focused on inbound channels.
    if (
      lead.source === "WEBSITE" ||
      lead.source === "WHATSAPP" ||
      lead.source === "NEWSLETTER"
    ) {
      entry[lead.source] += 1;
    }
  }
  const leadsSourceTrend: LeadsSourceTrendPoint[] = Array.from(
    trendDayMap.entries()
  ).map(([date, counts]) => {
    const d = new Date(date + "T00:00:00");
    return {
      date,
      label: `${DAY_LABELS[d.getDay()]} ${d.getDate()}`,
      counts,
    };
  });

  // Build status-counts map for the conversion funnel.
  const statusCounts: LeadStatusCounts = {};
  for (const item of leadsByStatusRaw) {
    statusCounts[item.status] = item._count._all;
  }

  // ─── Lead score distribution ────────────────────────────────────────────────
  // Compute scores for every lead (pure, no DB calls inside calculateLeadScore)
  // and roll them up into per-tier counts + an average. Used by the
  // "Distribusi Skor Lead" card and the high-tier deep-link badge.
  const scoreSummary = summarizeLeadScores(leadsForScoring);
  const scoreTierRows: {
    tier: LeadScoreTier;
    label: string;
    count: number;
    /** Tailwind classes for the bar fill + label text. */
    barClass: string;
    textClass: string;
    dotClass: string;
  }[] = [
    {
      tier: "high",
      label: "Tinggi",
      count: scoreSummary.high,
      barClass: "bg-gold",
      textClass: "text-gold-700",
      dotClass: "bg-gold",
    },
    {
      tier: "medium",
      label: "Sedang",
      count: scoreSummary.medium,
      barClass: "bg-navy",
      textClass: "text-navy",
      dotClass: "bg-navy",
    },
    {
      tier: "low",
      label: "Rendah",
      count: scoreSummary.low,
      barClass: "bg-slate-400",
      textClass: "text-slate-500",
      dotClass: "bg-slate-400",
    },
  ];
  const scoreMaxCount = Math.max(
    1,
    scoreSummary.high,
    scoreSummary.medium,
    scoreSummary.low
  );

  const stats = [
    {
      label: "Total Leads",
      value: totalLeads,
      hint: `${newLeadsThisWeek} baru minggu ini`,
      icon: Inbox,
      tone: "gold" as const,
    },
    {
      label: "Layanan Aktif",
      value: totalServices,
      hint: "Tersedia di situs publik",
      icon: Briefcase,
      tone: "navy" as const,
    },
    {
      label: "Artikel Terbit",
      value: publishedPosts,
      hint: "Status PUBLISHED",
      icon: Newspaper,
      tone: "navy" as const,
    },
    {
      label: "Testimoni Aktif",
      value: totalTestimonials,
      hint: "Tampil di situs",
      icon: Users,
      tone: "gold" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-navy-mesh p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-navy opacity-30 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-gold/15 ring-1 ring-gold/30 shrink-0">
            <Sparkles className="size-6 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gold text-xs font-semibold uppercase tracking-[0.18em]">
              Selamat datang
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">
              Ringkasan Pintu Legal
            </h2>
            <p className="text-white/60 text-sm mt-1.5 max-w-xl">
              Pantau lead masuk, kelola layanan, dan perbarui konten situs dari
              satu tempat.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 self-start rounded-lg bg-gold hover:bg-gold-600 text-navy font-semibold text-sm px-4 py-2.5 transition-colors"
          >
            Lihat Leads
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border shadow-soft">
              <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-ink-soft">
                    {s.label}
                  </CardTitle>
                </div>
                <div
                  className={
                    "inline-flex items-center justify-center size-9 rounded-lg " +
                    (s.tone === "gold"
                      ? "bg-gold-50 text-gold-600"
                      : "bg-navy-50 text-navy")
                  }
                >
                  <Icon className="size-4.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-ink tabular-nums">
                  {s.value.toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-ink-soft mt-1 flex items-center gap-1">
                  {s.label === "Total Leads" ? (
                    <TrendingUp className="size-3 text-gold-600" />
                  ) : (
                    <Clock className="size-3 text-ink-soft opacity-60" />
                  )}
                  {s.hint}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Perlu Perhatian — stale leads (>48h without update) */}
      {staleLeadsCount > 0 && (
        <Card className="border-gold-300 bg-gradient-to-br from-gold-50 via-white to-white shadow-soft">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="inline-flex items-center justify-center size-10 rounded-lg bg-gold-100 text-gold-700 ring-1 ring-gold-200 shrink-0">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
                    Perlu Perhatian
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-ink mt-0.5">
                    {staleLeadsCount} lead menunggu tindak lanjut
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-soft mt-1 max-w-xl">
                    Lead dengan status <span className="font-medium text-ink">Baru</span>{" "}
                    atau <span className="font-medium text-ink">Dihubungi</span> yang belum
                    diperbarui selama lebih dari 48 jam. Segera tindak lanjuti agar tidak
                    kehilangan calon klien.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-gold-600 hover:bg-gold-700 text-white shrink-0"
              >
                <Link href="/admin/leads?stale=1">
                  Lihat Lead
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadsChart data={leadsByDay} />
        <LeadsByServiceChart data={leadsByService} />
      </div>

      {/* Source breakdown row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LeadsSourceChart data={leadsBySource} />
        </div>
        <div className="lg:col-span-2">
          <Card className="shadow-soft h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-ink">
                Status Leads
              </CardTitle>
              <p className="text-xs text-ink-soft mt-1">
                Distribusi lead berdasarkan status saat ini
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(LEAD_STATUS).map(([key, val]) => {
                  const count = recentLeads.filter((l) => l.status === key).length;
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-border bg-surface-alt p-3 text-center"
                    >
                      <div className="text-2xl font-bold text-navy tabular-nums">
                        {count}
                      </div>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={leadStatusBadgeClass(key)}
                        >
                          {val.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-ink-soft">
                * Status distribution berdasarkan 5 lead terbaru. Lihat semua lead di halaman Kelola Leads.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead Score Distribution — full-width row below the source breakdown.
          Shows high/medium/low tier counts with horizontal bars + average
          score. The "Skor Tertinggi" link deep-links to /admin/leads?score=high
          so the admin can jump straight to the high-tier leads. */}
      <Card className="shadow-soft">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <span className="inline-flex items-center justify-center size-7 rounded-lg bg-gold-50 text-gold-600">
                <Gauge className="size-4" />
              </span>
              Distribusi Skor Lead
            </CardTitle>
            <p className="text-xs text-ink-soft">
              Penilaian otomatis 0–100 berdasarkan kelengkapan data, sumber, dan
              status. Tier Tinggi = 70–100 (potensi tertinggi).
            </p>
          </div>
          <div className="flex items-baseline gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs text-ink-soft uppercase tracking-wider">
                Rata-rata
              </div>
              <div className="text-2xl font-bold text-navy tabular-nums">
                {scoreSummary.average}
                <span className="text-sm text-ink-soft font-normal">/100</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {scoreSummary.total === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface-alt/50 py-8 text-center text-sm text-ink-soft">
              Belum ada lead untuk dinilai.
            </div>
          ) : (
            <>
              {scoreTierRows.map((row) => {
                const widthPct = Math.round(
                  (row.count / scoreMaxCount) * 100
                );
                const sharePct =
                  scoreSummary.total > 0
                    ? Math.round((row.count / scoreSummary.total) * 100)
                    : 0;
                return (
                  <div key={row.tier} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                        <span
                          className={cn("size-2 rounded-full", row.dotClass)}
                          aria-hidden
                        />
                        {row.label}
                        <span className="text-ink-soft font-normal">
                          (skor{" "}
                          {row.tier === "high"
                            ? "70–100"
                            : row.tier === "medium"
                              ? "40–69"
                              : "0–39"}
                          )
                        </span>
                      </span>
                      <span className="tabular-nums text-ink-soft">
                        <span className={cn("font-semibold", row.textClass)}>
                          {row.count}
                        </span>{" "}
                        lead · {sharePct}%
                      </span>
                    </div>
                    <div
                      className="h-2.5 w-full rounded-full bg-surface-alt overflow-hidden"
                      role="progressbar"
                      aria-valuenow={row.count}
                      aria-valuemin={0}
                      aria-valuemax={scoreSummary.total}
                      aria-label={`Lead dengan skor ${row.label}: ${row.count} dari ${scoreSummary.total}`}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          row.barClass
                        )}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-xs text-ink-soft">
                  Total{" "}
                  <span className="font-semibold text-navy tabular-nums">
                    {scoreSummary.total}
                  </span>{" "}
                  lead dinilai
                </p>
                {scoreSummary.high > 0 && (
                  <Link
                    href="/admin/leads?score=high"
                    className="inline-flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold transition-colors"
                  >
                    <Star className="size-3.5" />
                    Lihat {scoreSummary.high} lead skor tertinggi
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Conversion funnel — full-width row below the source breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsFunnelChart statusCounts={statusCounts} />
        </div>
        <div className="lg:col-span-1">
          <Card className="shadow-soft h-full bg-navy-mesh text-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Ringkasan Konversi
              </CardTitle>
              <p className="text-xs text-white/60 mt-1">
                Performa funnel lead secara keseluruhan
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const totalActive =
                  (statusCounts["NEW"] ?? 0) +
                  (statusCounts["CONTACTED"] ?? 0) +
                  (statusCounts["QUALIFIED"] ?? 0) +
                  (statusCounts["CONVERTED"] ?? 0);
                const converted = statusCounts["CONVERTED"] ?? 0;
                const lost = statusCounts["LOST"] ?? 0;
                const grandTotal = totalActive + lost;
                const conversionRate =
                  grandTotal > 0
                    ? Math.round((converted / grandTotal) * 100)
                    : 0;
                const lossRate =
                  grandTotal > 0 ? Math.round((lost / grandTotal) * 100) : 0;
                return (
                  <>
                    <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3">
                      <div className="text-xs text-white/60 uppercase tracking-wider">
                        Tingkat Konversi
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gold tabular-nums">
                          {conversionRate}%
                        </span>
                        <span className="text-xs text-white/60">
                          ({converted} terkonversi)
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3">
                      <div className="text-xs text-white/60 uppercase tracking-wider">
                        Tingkat Kehilangan
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-red-300 tabular-nums">
                          {lossRate}%
                        </span>
                        <span className="text-xs text-white/60">
                          ({lost} lead hilang)
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3">
                      <div className="text-xs text-white/60 uppercase tracking-wider">
                        Lead Aktif di Funnel
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white tabular-nums">
                          {totalActive}
                        </span>
                        <span className="text-xs text-white/60">
                          dari {grandTotal} total lead
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead-source trend — full-width line chart below the funnel row */}
      <LeadsSourceTrendChart data={leadsSourceTrend} />

      {/* Recent leads + Quick links */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-ink">
              Leads Terbaru
            </CardTitle>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold"
            >
              Lihat semua
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <div className="px-6 py-12 text-center text-ink-soft text-sm">
                Belum ada lead masuk.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Nama</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="pl-6 font-medium text-ink">
                        {lead.name}
                      </TableCell>
                      <TableCell className="text-ink-soft text-sm">
                        {lead.service?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={leadStatusBadgeClass(lead.status)}
                        >
                          {LEAD_STATUS[lead.status]?.label ?? lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right text-ink-soft text-xs">
                        {formatDistanceToNow(lead.createdAt, {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-ink">
              Akses Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { href: "/admin/leads", label: "Kelola Leads", icon: Inbox },
              { href: "/admin/services", label: "Kelola Layanan", icon: Briefcase },
              { href: "/admin/blog", label: "Tulis Blog", icon: Newspaper },
              { href: "/admin/testimonials", label: "Testimoni", icon: Users },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-alt transition-colors"
                >
                  <div className="inline-flex items-center justify-center size-8 rounded-lg bg-navy-50 text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-medium text-ink">{q.label}</span>
                  <ArrowRight className="ml-auto size-4 text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

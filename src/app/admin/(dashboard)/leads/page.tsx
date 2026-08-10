import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { LeadsTable } from "@/components/admin/leads-table";
import { calculateLeadScore } from "@/lib/lead-scoring";

export const dynamic = "force-dynamic";

/**
 * /admin/leads — server component.
 *
 * Fetches every lead with its service + status history, then computes a score
 * for each one server-side and passes the resulting `scores` map to the
 * client `<LeadsTable>`. The score is purely a function of the lead's fields
 * (no DB calls inside `calculateLeadScore`), so the server-computed values
 * are byte-for-byte identical to what the table would compute client-side —
 * passing them in simply avoids recomputing on the client.
 *
 * URL params:
 *   - `?score=high` → opens the table with the "Skor Tertinggi" filter chip
 *     active. Deep-linked from the dashboard "Distribusi Skor Lead" card.
 *   - `?stale=1`   → existing "Perlu Perhatian" deep-link (handled client-side).
 */
export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; stale?: string }>;
}) {
  const params = await searchParams;
  const initialHighOnly = params.score === "high";

  const [leads, services] = await Promise.all([
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          select: { id: true, name: true, slug: true },
        },
        statusHistories: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    db.service.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const safeLeads = leads.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email ?? "",
    businessName: l.businessName ?? "",
    message: l.message,
    status: l.status,
    source: l.source,
    note: l.note ?? "",
    serviceId: l.serviceId ?? "",
    serviceName: l.service?.name ?? null,
    serviceSlug: l.service?.slug ?? null,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    statusHistories: l.statusHistories.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      changedBy: h.changedBy,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  // Compute scores server-side. Map<id, LeadScoreResult> — passed to the
  // table as a plain object so it can be serialized as a prop. The table
  // uses these directly instead of recomputing per render.
  const scores: Record<
    string,
    { score: number; tier: "high" | "medium" | "low"; factors: string[] }
  > = {};
  for (const l of safeLeads) {
    scores[l.id] = calculateLeadScore(l);
  }

  const highCount = Object.values(scores).filter(
    (s) => s.tier === "high"
  ).length;
  const avgScore =
    safeLeads.length > 0
      ? Math.round(
          Object.values(scores).reduce((sum, s) => sum + s.score, 0) /
            safeLeads.length
        )
      : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            Leads{" "}
            <span className="text-ink-soft font-medium">
              ({safeLeads.length})
            </span>
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Kelola setiap lead, perbarui status, dan tambahkan catatan internal.
          </p>
        </div>

        {/* Quick KPI strip — high-tier count + average score. Visible at a
            glance so the admin knows the overall lead-quality shape before
            even touching the table. */}
        {safeLeads.length > 0 && (
          <div className="flex gap-2">
            {!initialHighOnly && highCount > 0 ? (
              <Link
                href="/admin/leads?score=high"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700 hover:border-gold-400 hover:text-gold-700 transition-colors"
                title="Tampilkan hanya lead dengan skor 70–100"
              >
                <Star className="size-3.5" />
                {highCount} lead skor tinggi
                <ArrowRight className="size-3" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700">
                <Star className="size-3.5" />
                {highCount} lead skor tinggi
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy">
              Rata-rata skor: <span className="tabular-nums">{avgScore}</span>
            </div>
          </div>
        )}
      </div>

      <LeadsTable
        leads={safeLeads}
        services={services}
        scores={scores}
        initialHighOnly={initialHighOnly}
      />
    </div>
  );
}

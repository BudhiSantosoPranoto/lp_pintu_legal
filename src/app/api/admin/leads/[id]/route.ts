import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";
import { logAdminActivity } from "@/lib/admin-activity";

const patchSchema = z.object({
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"])
    .optional(),
  note: z.string().max(5000).optional(),
  // Optional human-readable note attached to the status history entry
  // (separate from the lead's internal `note` field). Useful to log the
  // reason for the transition (e.g. "Klien dihubungi via WhatsApp").
  historyNote: z.string().max(1000).optional(),
});

type Params = { params: Promise<{ id: string }> };

async function ensureAuth() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

/**
 * GET /api/admin/leads/[id] — fetch a single lead with its status history
 * timeline. Used by the lead detail sheet to render the "Riwayat Status"
 * section without a full page reload.
 */
export async function GET(_req: Request, { params }: Params) {
  const session = await ensureAuth();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        service: { select: { id: true, name: true, slug: true } },
        statusHistories: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!lead) {
      return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });
    }
    // Serialize dates to ISO strings for the client.
    return NextResponse.json({
      ok: true,
      lead: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        businessName: lead.businessName,
        message: lead.message,
        status: lead.status,
        source: lead.source,
        note: lead.note,
        serviceId: lead.serviceId,
        serviceName: lead.service?.name ?? null,
        serviceSlug: lead.service?.slug ?? null,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        statusHistories: lead.statusHistories.map((h) => ({
          id: h.id,
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          note: h.note,
          changedBy: h.changedBy,
          createdAt: h.createdAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error("[admin/leads] GET failed", err);
    return NextResponse.json({ error: "Gagal memuat lead" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await ensureAuth();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.note !== undefined) data.note = parsed.data.note.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true, updated: false });
  }

  try {
    // Fetch the current lead BEFORE updating, so we can record the
    // accurate `fromStatus` in the audit trail.
    const existing = await db.lead.findUnique({
      where: { id },
      select: { status: true, note: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });
    }

    const newStatus = (data.status as string | undefined) ?? existing.status;
    const statusChanged = newStatus !== existing.status;

    const updated = await db.lead.update({
      where: { id },
      data,
      select: { id: true, status: true, note: true, updatedAt: true },
    });

    // Append a history entry whenever the status actually transitions.
    if (statusChanged) {
      await db.leadStatusHistory.create({
        data: {
          leadId: id,
          fromStatus: existing.status,
          toStatus: newStatus,
          note: parsed.data.historyNote?.trim() || null,
          changedBy: session.email,
        },
      });
    }

    // Audit log — fire-and-forget, never blocks the response.
    void logAdminActivity(
      session.email,
      "LEAD_STATUS_UPDATE",
      "lead",
      id,
      {
        fromStatus: existing.status,
        toStatus: newStatus,
        statusChanged,
        noteUpdated: parsed.data.note !== undefined,
      }
    );

    // Invalidate lead score cache so the next read recalculates.
    try {
      const { invalidateLeadScore } = await import("@/lib/lead-scoring-cache");
      invalidateLeadScore(id);
    } catch {
      // Cache invalidation is best-effort
    }

    return NextResponse.json({
      ok: true,
      lead: updated,
      statusChanged,
    });
  } catch (err) {
    console.error("[admin/leads] PATCH failed", err);
    return NextResponse.json(
      { error: "Gagal memperbarui lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await ensureAuth();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;
  try {
    // Snapshot lead name for the audit trail before deletion (so the log
    // still identifies which lead was removed after the row is gone).
    const snapshot = await db.lead.findUnique({
      where: { id },
      select: { name: true, phone: true, status: true, source: true },
    });

    // Status history rows are deleted automatically via the `onDelete: Cascade`
    // relation on LeadStatusHistory.lead.
    await db.lead.delete({ where: { id } });

    void logAdminActivity(
      session.email,
      "LEAD_DELETE",
      "lead",
      id,
      snapshot
        ? {
            name: snapshot.name,
            phone: snapshot.phone,
            status: snapshot.status,
            source: snapshot.source,
          }
        : null
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/leads] DELETE failed", err);
    return NextResponse.json({ error: "Gagal menghapus lead" }, { status: 500 });
  }
}

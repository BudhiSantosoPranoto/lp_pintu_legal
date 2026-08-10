import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";
import { logAdminActivity } from "@/lib/admin-activity";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
  action: z.enum(["update_status", "delete"]),
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"])
    .optional(),
});

/**
 * POST /api/admin/leads/bulk
 *
 * Efficiently process bulk operations on multiple leads at once. Two actions
 * are supported:
 *
 *  - `update_status`: sets every selected lead's status to `status`. A
 *    `LeadStatusHistory` row is created for each lead whose status actually
 *    transitions, so the per-lead audit trail stays intact.
 *  - `delete`: removes every selected lead. Status history rows are
 *    cascade-deleted automatically by the schema.
 *
 * Body: `{ ids: string[], action: "update_status" | "delete", status?: string }`
 * Response: `{ ok: true, affected: number }`
 */
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validasi gagal",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { ids, action } = parsed.data;
  // Deduplicate IDs so the same lead isn't processed twice.
  const uniqueIds = Array.from(new Set(ids));

  try {
    if (action === "delete") {
      const result = await db.lead.deleteMany({
        where: { id: { in: uniqueIds } },
      });

      void logAdminActivity(
        session.email,
        "LEAD_BULK_DELETE",
        "lead",
        null,
        { ids: uniqueIds, count: result.count }
      );

      return NextResponse.json({ ok: true, affected: result.count });
    }

    // action === "update_status"
    const newStatus = parsed.data.status;
    if (!newStatus) {
      return NextResponse.json(
        { error: "Status wajib diisi untuk aksi update_status" },
        { status: 422 }
      );
    }

    // Fetch the leads that actually exist + whose status differs, so we only
    // create history rows for genuine transitions.
    const existing = await db.lead.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, status: true },
    });

    const toTransition = existing.filter((l) => l.status !== newStatus);
    const toTransitionIds = toTransition.map((l) => l.id);

    // Run the update + history inserts in a single transaction so the audit
    // trail can never diverge from the lead state.
    await db.$transaction(async (tx) => {
      if (toTransitionIds.length > 0) {
        await tx.lead.updateMany({
          where: { id: { in: toTransitionIds } },
          data: { status: newStatus },
        });

        await tx.leadStatusHistory.createMany({
          data: toTransition.map((l) => ({
            leadId: l.id,
            fromStatus: l.status,
            toStatus: newStatus,
            note: "Diperbarui secara massal",
            changedBy: session.email,
          })),
        });
      }
    });

    void logAdminActivity(
      session.email,
      "LEAD_BULK_UPDATE",
      "lead",
      null,
      {
        ids: uniqueIds,
        toStatus: newStatus,
        affected: toTransitionIds.length,
        skipped: existing.length - toTransitionIds.length,
      }
    );

    // Invalidate lead score cache for all affected leads.
    try {
      const { invalidateAllLeadScores } = await import("@/lib/lead-scoring-cache");
      invalidateAllLeadScores();
    } catch {
      // Best-effort
    }

    return NextResponse.json({
      ok: true,
      affected: toTransitionIds.length,
      skipped: existing.length - toTransitionIds.length,
    });
  } catch (err) {
    console.error("[admin/leads/bulk] POST failed", err);
    return NextResponse.json(
      { error: "Gagal memproses operasi massal" },
      { status: 500 }
    );
  }
}

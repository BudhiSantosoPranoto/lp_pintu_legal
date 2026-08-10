import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  action: z.string().trim().optional(),
  email: z.string().trim().optional(),
});

/**
 * GET /api/admin/activities
 *
 * Returns the admin activity log with pagination + filtering. Useful for
 * dashboards or admin tools that want to render the audit trail without a
 * full page reload.
 *
 * Query params:
 *   - page      — 1-based page number (default 1)
 *   - pageSize  — items per page, max 100 (default 50)
 *   - action    — filter by exact action key (e.g. "LOGIN")
 *   - email     — case-insensitive partial match on admin email
 *
 * Response: `{ ok, activities, page, pageSize, total, totalPages }`
 */
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
    email: url.searchParams.get("email") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const { page, pageSize, action, email } = parsed.data;

  const where: {
    action?: string;
    adminEmail?: { contains: string };
  } = {};
  if (action) where.action = action;
  if (email) where.adminEmail = { contains: email.toLowerCase() };

  try {
    const [total, rows] = await Promise.all([
      db.adminActivity.count({ where }),
      db.adminActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const activities = rows.map((r) => ({
      id: r.id,
      adminEmail: r.adminEmail,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      detail: r.detail,
      ipAddress: r.ipAddress,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      activities,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (err) {
    console.error("[admin/activities] GET failed", err);
    return NextResponse.json(
      { error: "Gagal memuat aktivitas" },
      { status: 500 }
    );
  }
}

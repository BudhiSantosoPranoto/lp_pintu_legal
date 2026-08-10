import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";
import { logAdminActivity } from "@/lib/admin-activity";

const patchSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    slug: z
      .string()
      .min(2)
      .max(140)
      .regex(/^[a-z0-9-]+$/, "Slug tidak valid")
      .optional(),
    shortDescription: z.string().min(2).max(200).optional(),
    description: z.string().max(8000).optional().or(z.literal("")),
    icon: z.string().max(60).optional(),
    durationLabel: z.string().max(120).nullable().optional(),
    priceLabel: z.string().max(120).nullable().optional(),
    categoryId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession();
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
  const d = parsed.data;

  // Slug uniqueness check
  if (d.slug) {
    const clash = await db.service.findFirst({
      where: { slug: d.slug, NOT: { id } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { error: `Slug "${d.slug}" sudah digunakan.` },
        { status: 409 }
      );
    }
  }

  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) {
    if (k === "description" && typeof v === "string") data.description = v;
    else if (v !== undefined) data[k] = v;
  }

  try {
    const updated = await db.service.update({
      where: { id },
      data,
      select: { id: true, slug: true, isActive: true, isFeatured: true },
    });

    void logAdminActivity(
      session.email,
      "SERVICE_UPDATE",
      "service",
      id,
      {
        slug: d.slug ?? null,
        nameUpdated: d.name !== undefined,
        isActive: d.isActive,
        isFeatured: d.isFeatured,
      }
    );

    return NextResponse.json({ ok: true, service: updated });
  } catch (err) {
    console.error("[admin/services] PATCH failed", err);
    return NextResponse.json(
      { error: "Gagal memperbarui layanan" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const snapshot = await db.service.findUnique({
      where: { id },
      select: { name: true, slug: true },
    });
    await db.service.delete({ where: { id } });

    void logAdminActivity(
      session.email,
      "SERVICE_DELETE",
      "service",
      id,
      snapshot ? { name: snapshot.name, slug: snapshot.slug } : null
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/services] DELETE failed", err);
    return NextResponse.json({ error: "Gagal menghapus layanan" }, { status: 500 });
  }
}

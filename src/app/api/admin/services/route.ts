import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";
import { logAdminActivity } from "@/lib/admin-activity";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/, "Slug tidak valid"),
  shortDescription: z.string().min(2).max(200),
  description: z.string().max(8000).optional().or(z.literal("")),
  icon: z.string().max(60).default("Building2"),
  durationLabel: z.string().max(120).nullable().optional(),
  priceLabel: z.string().max(120).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  // Slug uniqueness check
  const existing = await db.service.findUnique({ where: { slug: d.slug } });
  if (existing) {
    return NextResponse.json(
      { error: `Slug "${d.slug}" sudah digunakan.` },
      { status: 409 }
    );
  }

  try {
    const service = await db.service.create({
      data: {
        name: d.name,
        slug: d.slug,
        shortDescription: d.shortDescription,
        description: d.description ?? "",
        icon: d.icon,
        durationLabel: d.durationLabel ?? null,
        priceLabel: d.priceLabel ?? null,
        categoryId: d.categoryId || null,
        isActive: d.isActive,
        isFeatured: d.isFeatured,
        sortOrder: d.sortOrder,
        highlights: "[]",
        processSteps: "[]",
        requirements: "[]",
        faqsJson: "[]",
      },
      select: { id: true, slug: true },
    });

    void logAdminActivity(
      session.email,
      "SERVICE_CREATE",
      "service",
      service.id,
      { name: d.name, slug: d.slug, isActive: d.isActive }
    );

    return NextResponse.json({ ok: true, service });
  } catch (err) {
    console.error("[admin/services] POST failed", err);
    return NextResponse.json(
      { error: "Gagal membuat layanan" },
      { status: 500 }
    );
  }
}

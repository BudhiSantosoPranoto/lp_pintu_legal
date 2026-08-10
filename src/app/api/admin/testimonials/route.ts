import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  company: z.string().max(200).nullable().optional(),
  role: z.string().max(120).nullable().optional(),
  quote: z.string().min(2).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
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
  try {
    const t = await db.testimonial.create({
      data: {
        name: d.name,
        company: d.company ?? null,
        role: d.role ?? null,
        quote: d.quote,
        rating: d.rating,
        isActive: d.isActive,
        sortOrder: d.sortOrder,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, testimonial: t });
  } catch (err) {
    console.error("[admin/testimonials] POST failed", err);
    return NextResponse.json(
      { error: "Gagal membuat testimoni" },
      { status: 500 }
    );
  }
}

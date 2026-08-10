import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";

const patchSchema = z.object({
  question: z.string().min(2).max(500).optional(),
  answer: z.string().min(2).max(5000).optional(),
  category: z.string().max(120).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

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
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) data[k] = v;
  }
  try {
    const updated = await db.faq.update({
      where: { id },
      data,
      select: { id: true, isActive: true },
    });
    return NextResponse.json({ ok: true, faq: updated });
  } catch (err) {
    console.error("[admin/faqs] PATCH failed", err);
    return NextResponse.json({ error: "Gagal memperbarui FAQ" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.faq.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/faqs] DELETE failed", err);
    return NextResponse.json({ error: "Gagal menghapus FAQ" }, { status: 500 });
  }
}

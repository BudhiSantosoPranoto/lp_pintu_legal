import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";

const createSchema = z.object({
  question: z.string().min(2).max(500),
  answer: z.string().min(2).max(5000),
  category: z.string().max(120).default("Umum"),
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
    const faq = await db.faq.create({
      data: {
        question: d.question,
        answer: d.answer,
        category: d.category,
        isActive: d.isActive,
        sortOrder: d.sortOrder,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, faq });
  } catch (err) {
    console.error("[admin/faqs] POST failed", err);
    return NextResponse.json({ error: "Gagal membuat FAQ" }, { status: 500 });
  }
}

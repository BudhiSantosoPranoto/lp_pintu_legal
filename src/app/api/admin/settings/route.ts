import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";

const patchSchema = z.object({
  settings: z.record(z.string(), z.string().max(10000)),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const rows = await db.siteSetting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({
    ok: true,
    settings: Object.fromEntries(rows.map((r) => [r.key, r.value])),
  });
}

export async function PATCH(req: Request) {
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const entries = Object.entries(parsed.data.settings);
  if (entries.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  try {
    // Upsert each key. SQLite doesn't support createMany with conflict — use a loop.
    for (const [key, value] of entries) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return NextResponse.json({ ok: true, updated: entries.length });
  } catch (err) {
    console.error("[admin/settings] PATCH failed", err);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}

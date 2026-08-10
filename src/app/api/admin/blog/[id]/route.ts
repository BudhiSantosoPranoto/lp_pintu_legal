import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";
import { logAdminActivity } from "@/lib/admin-activity";
import { normalizeTagsInput } from "@/data/queries";

const patchSchema = z
  .object({
    title: z.string().min(2).max(200).optional(),
    slug: z
      .string()
      .min(2)
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug tidak valid")
      .optional(),
    excerpt: z.string().min(2).max(300).optional(),
    content: z.string().max(200000).optional(),
    authorName: z.string().max(120).optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    categoryId: z.string().nullable().optional(),
    publishedAt: z.string().datetime().nullable().optional(),
    tags: z.string().max(500).optional(),
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

  if (d.slug) {
    const clash = await db.blogPost.findFirst({
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
    if (k === "publishedAt") {
      data.publishedAt = v ? new Date(v as string) : null;
    } else if (k === "categoryId") {
      data.categoryId = v || null;
    } else if (k === "tags") {
      // Normalize: lowercase, trim, 30-char cap, dedupe, comma-join.
      // Empty input → empty string (no tags).
      data.tags = normalizeTagsInput((v as string) ?? "");
    } else if (v !== undefined) {
      data[k] = v;
    }
  }

  try {
    const updated = await db.blogPost.update({
      where: { id },
      data,
      select: { id: true, slug: true, status: true },
    });

    void logAdminActivity(
      session.email,
      "BLOG_UPDATE",
      "blog_post",
      id,
      {
        slug: d.slug ?? null,
        status: d.status ?? null,
        titleUpdated: d.title !== undefined,
        contentUpdated: d.content !== undefined,
      }
    );

    return NextResponse.json({ ok: true, post: updated });
  } catch (err) {
    console.error("[admin/blog] PATCH failed", err);
    return NextResponse.json(
      { error: "Gagal memperbarui artikel" },
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
    // Snapshot title/slug for the audit log before deletion.
    const snapshot = await db.blogPost.findUnique({
      where: { id },
      select: { title: true, slug: true, status: true },
    });
    await db.blogPost.delete({ where: { id } });

    void logAdminActivity(
      session.email,
      "BLOG_DELETE",
      "blog_post",
      id,
      snapshot
        ? {
            title: snapshot.title,
            slug: snapshot.slug,
            status: snapshot.status,
          }
        : null
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/blog] DELETE failed", err);
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 });
  }
}

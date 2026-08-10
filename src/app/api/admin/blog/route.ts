import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";
import { logAdminActivity } from "@/lib/admin-activity";
import { normalizeTagsInput } from "@/data/queries";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug tidak valid"),
  excerpt: z.string().min(2).max(300),
  content: z.string().max(200000).default(""),
  authorName: z.string().max(120).default("Tim Pintu Legal"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  categoryId: z.string().nullable().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  // Comma-separated tags — normalized to lowercase, trimmed, 30-char-capped,
  // deduplicated, then re-joined. Empty string = no tags.
  tags: z.string().max(500).optional(),
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

  const clash = await db.blogPost.findUnique({ where: { slug: d.slug } });
  if (clash) {
    return NextResponse.json(
      { error: `Slug "${d.slug}" sudah digunakan.` },
      { status: 409 }
    );
  }

  try {
    const post = await db.blogPost.create({
      data: {
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        authorName: d.authorName,
        status: d.status,
        categoryId: d.categoryId || null,
        publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
        tags: normalizeTagsInput(d.tags ?? ""),
      },
      select: { id: true, slug: true, status: true },
    });

    void logAdminActivity(
      session.email,
      "BLOG_CREATE",
      "blog_post",
      post.id,
      { title: d.title, slug: d.slug, status: d.status }
    );

    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error("[admin/blog] POST failed", err);
    return NextResponse.json({ error: "Gagal membuat artikel" }, { status: 500 });
  }
}

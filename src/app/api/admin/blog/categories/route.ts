import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";

const slugRegex = /^[a-z0-9-]+$/;

const createSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(slugRegex, "Slug tidak valid"),
  description: z.string().max(300).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

/**
 * GET /api/admin/blog/categories
 * Returns all categories (including those with zero posts) with their
 * post counts. Public-facing `getBlogCategories()` filters zero-post
 * categories — admin needs to see them all.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const cats = await db.blogCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          posts: {
            where: {
              status: "PUBLISHED",
              publishedAt: { lte: new Date() },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      postCount: c._count.posts,
    })),
  });
}

/**
 * POST /api/admin/blog/categories
 * Creates a new blog category. Slug must be unique.
 */
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

  const clash = await db.blogCategory.findUnique({ where: { slug: d.slug } });
  if (clash) {
    return NextResponse.json(
      { error: `Slug "${d.slug}" sudah digunakan.` },
      { status: 409 }
    );
  }

  try {
    const cat = await db.blogCategory.create({
      data: {
        name: d.name,
        slug: d.slug,
        description: d.description ?? null,
        sortOrder: d.sortOrder ?? 0,
      },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ ok: true, category: cat });
  } catch (err) {
    console.error("[admin/blog/categories] POST failed", err);
    return NextResponse.json(
      { error: "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}

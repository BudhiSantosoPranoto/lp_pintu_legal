import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin";

const slugRegex = /^[a-z0-9-]+$/;

const patchSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    slug: z
      .string()
      .min(2)
      .max(80)
      .regex(slugRegex, "Slug tidak valid")
      .optional(),
    description: z.string().max(300).optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .strict();

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/blog/categories/[id]
 * Updates one or more fields of a blog category. Passing `description: null`
 * clears the description; passing `description: ""` is treated as null.
 */
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
    const clash = await db.blogCategory.findFirst({
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
  if (d.name !== undefined) data.name = d.name;
  if (d.slug !== undefined) data.slug = d.slug;
  if (d.description !== undefined) {
    const v = d.description;
    data.description = v && v.trim().length > 0 ? v.trim() : null;
  }
  if (d.sortOrder !== undefined) data.sortOrder = d.sortOrder;

  try {
    const updated = await db.blogCategory.update({
      where: { id },
      data,
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ ok: true, category: updated });
  } catch (err) {
    console.error("[admin/blog/categories] PATCH failed", err);
    return NextResponse.json(
      { error: "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blog/categories/[id]
 * Deletes a blog category. Posts linked to the category are unlinked
 * (categoryId set to NULL) — they are NOT deleted, because the post is
 * independent content and the user can reassign them later.
 *
 * Returns 409 if the category still has linked posts, with a hint to
 * reassign or unlink them first. This is a safety net against accidental
 * bulk unassignment — admin must explicitly unlink posts first.
 */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const { id } = await params;

  const linkedPosts = await db.blogPost.count({
    where: { categoryId: id },
  });
  if (linkedPosts > 0) {
    return NextResponse.json(
      {
        error: `Kategori masih memiliki ${linkedPosts} artikel terkait. Ubah kategori artikel terlebih dahulu sebelum menghapus.`,
      },
      { status: 409 }
    );
  }

  try {
    await db.blogCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/blog/categories] DELETE failed", err);
    return NextResponse.json(
      { error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}

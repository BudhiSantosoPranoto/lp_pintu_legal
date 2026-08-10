import { db } from "@/lib/db";
import { BlogTable } from "@/components/admin/blog-table";
import {
  BlogCategoryManager,
  type BlogCategoryRow,
} from "@/components/admin/blog-category-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const [posts, categoriesRaw] = await Promise.all([
    db.blogPost.findMany({
      orderBy: [{ status: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.blogCategory.findMany({
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
    }),
  ]);

  const categories: Pick<
    { id: string; name: string; slug: string },
    "id" | "name" | "slug"
  >[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const categoryRows: BlogCategoryRow[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    postCount: c._count.posts,
  }));

  const safePosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    authorName: p.authorName,
    status: p.status,
    categoryId: p.categoryId ?? "",
    categoryName: p.category?.name ?? null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    tags: p.tags ?? "",
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink">
          Blog <span className="text-ink-soft font-medium">({safePosts.length})</span>
        </h2>
        <p className="text-sm text-ink-soft mt-1">
          Tulis dan kelola artikel. Status PUBLISHED akan tampil di situs publik.
        </p>
      </div>

      <BlogTable posts={safePosts} categories={categories} />

      <div className="pt-4 border-t border-border">
        <BlogCategoryManager categories={categoryRows} />
      </div>
    </div>
  );
}

# Task 5-A — full-stack-developer

## Task
Blog category pages `/blog/category/[slug]` + admin category management

## Files produced / modified

**New files (5):**
- `src/app/blog/category/[slug]/page.tsx` (server component, ~210 lines) — category listing page with `generateStaticParams` + `generateMetadata`, hero, posts grid, empty state, other categories, CTA, JSON-LD breadcrumb.
- `src/app/api/admin/blog/categories/route.ts` (~115 lines) — GET (list with post counts) + POST (create).
- `src/app/api/admin/blog/categories/[id]/route.ts` (~145 lines) — PATCH (partial update) + DELETE (with safety guard against deleting categories that still have linked posts).
- `src/components/admin/blog-category-manager.tsx` (~470 lines, "use client") — admin CRUD UI for blog categories with edit dialog + table view + sort-order controls.

**Modified files (5):**
- `prisma/schema.prisma` — added `description String?` and `sortOrder Int @default(0)` to `BlogCategory`.
- `src/data/queries.ts` — added `getBlogCategories()` (categories with PUBLISHED post counts, excludes zero-post categories), `getCategoryBySlug()`, `getPostsByCategory()` + new `BlogCategoryWithCount` / `BlogCategoryDetail` types.
- `src/components/site/blog-card.tsx` — added `"use client"` directive (required because of the `onClick={stopPropagation}` on the category link); wrapped the category badge in `<Link href="/blog/category/{slug}">` with `stopPropagation` so clicking it doesn't trigger the card's main link.
- `src/components/blog/blog-list-client.tsx` — updated the `FeaturedPost` component's category badge to also link to the category page (with stopPropagation).
- `src/app/blog/page.tsx` — added a "JELAJAHI KATEGORI" section below the posts grid showing each category as a card with description + post count, linking to `/blog/category/[slug]`.
- `src/app/blog/[slug]/page.tsx` — updated the hero's category badge to link to `/blog/category/[slug]` (was linking to `/blog`).
- `src/app/admin/(dashboard)/blog/page.tsx` — added `<BlogCategoryManager>` section below the existing `<BlogTable>` so admin can manage categories without leaving the blog admin page.

## Key decisions

- **Schema migration**: added `description` and `sortOrder` columns to `BlogCategory`. `db:push` ran cleanly (added nullable column + defaulted int column). Seeded description + sortOrder for the 3 existing categories (Panduan Bisnis, Legalitas, Info Perusahaan).
- **Server-side render for category page**: chose simple server-side render with `<BlogCard>` over reusing `<BlogListClient>` because category pages don't need client-side search/filter (a single category is a small fixed list). The grid uses `<Reveal>` for fade-in animation.
- **BlogCard as "use client"**: the category badge now has `onClick={e => e.stopPropagation()}` to prevent triggering the card's main link. This makes BlogCard a client component (server components can't pass event handlers). Already worked as a client component implicitly when imported into `BlogListClient` ("use client"), but now it must be explicitly client-side to be safely imported by server components too (e.g. the category page).
- **Admin category management placement**: chose to add `<BlogCategoryManager>` inline at the bottom of the existing `/admin/blog` page rather than creating a separate `/admin/blog/categories` route — keeps navigation simple (single blog admin page) and avoids adding a new NAV entry.
- **DELETE safety**: returns 409 if the category still has any linked posts (published or draft), forcing admin to reassign/unlink posts first. This prevents accidental bulk unassignment.
- **`generateStaticParams` filtering**: only pre-renders category slugs that have at least 1 published post (matches the spec). Categories with 0 published posts (e.g. `info-perusahaan`) are rendered on-demand when accessed — they show the empty state ("Belum ada artikel dalam kategori ini") rather than 404, since the category still exists.

## Verification

- `bun run lint` → 0 errors, 0 warnings (exit code 0).
- `curl /blog` → 200 (existing blog listing still works + new "JELAJAHI KATEGORI" section rendered with 2 category cards: Panduan Bisnis + Legalitas; Info Perusahaan correctly excluded because 0 published posts).
- `curl /blog/category/panduan-bisnis` → 200; HTML contains: "Kategori Blog" eyebrow, "Panduan Bisnis" H1, "2 Artikel" post count badge, "Artikel dalam Kategori Ini" subheading, "KATEGORI LAINNYA" section with link to `/blog/category/legalitas`, "Butuh konsultasi?" CTA → `/kontak`, `BreadcrumbList` JSON-LD, canonical `https://pintulegal.id/blog/category/panduan-bisnis`, OG title `Blog Panduan Bisnis — Pintu Legal`.
- `curl /blog/category/legalitas` → 200; renders 1 post (apa-itu-nib).
- `curl /blog/category/info-perusahaan` → 200; shows empty state with "Belum ada artikel dalam kategori ini." and "Kembali ke Blog" button.
- `curl /blog/category/non-existent` → 404.
- `curl /blog/apa-itu-nib` → 200 (existing blog detail still works; category badge now links to `/blog/category/legalitas`).
- `curl /layanan/pendirian-pt` → 200 (unrelated existing service detail unaffected).
- API endpoints `GET/POST /api/admin/blog/categories` and `PATCH/DELETE /api/admin/blog/categories/[id]` all return 401 when unauthenticated (admin auth gate intact).
- `/admin/blog` still 307-redirects to `/admin/login` (auth gate intact).

## Dev-server restart

The dev server died during this round (I killed the next-server process to clear the Prisma client cache after running `db:push` to add the new `BlogCategory.description` + `sortOrder` columns). Restarted via `setsid bash .zscripts/dev.sh` — dev.sh re-ran `bun install` + `bun run db:push` + started the dev server. After restart, the new Prisma client was correctly loaded and all routes returned 200.

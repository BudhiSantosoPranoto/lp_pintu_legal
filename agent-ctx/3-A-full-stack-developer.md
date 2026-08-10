# Task 3-A — Service comparison tool + related services on detail + blog related posts

- **Agent:** full-stack-developer
- **Task ID:** 3-A
- **Started:** 2026-01-05
- **Status:** ✅ Done

## Summary

Shipped three production-ready features for the PINTU LEGAL site:

1. **Service Comparison Tool** — A "Bandingkan Layanan" trigger button on `/layanan`
   that opens a Dialog where users multi-select 2–3 services and see them compared
   side-by-side in a premium table (navy header, gold accents, zebra striping,
   horizontal scroll on mobile).
2. **Related Services** on `/layanan/[slug]` — A "Layanan Terkait" section at the
   bottom showing up to 3 same-category services (filled with other services if
   the category is thin), rendered with the existing ServiceCard component.
3. **Blog Related Posts** on `/blog/[slug]` — A full-width "Artikel Terkait / Baca
   Juga" section at the bottom of article pages showing same-category posts. The
   existing sidebar "Artikel lainnya" (latest posts) is preserved unchanged.

## Files Produced (1 new)

- `src/components/layanan/service-comparison.tsx` (~370 lines, "use client")
  - Outline trigger button with `GitCompare` Lucide icon (gold accent).
  - shadcn `Dialog` with a navy header (gold icon chip + title + description).
  - Scrollable 2-column selection grid using shadcn `Checkbox` + label cards.
    Selected cards get a gold ring + soft shadow; disabled cards (when 3 are
    already selected) get dimmed + cursor-not-allowed.
  - Selection summary line (`{n} / 3 layanan dipilih`) + "Hapus pilihan" reset.
  - `AnimatePresence` swap between an empty state (`Pilih minimal 2 layanan untuk
    membandingkan` / `Pilih satu layanan lagi untuk mulai membandingkan`) and the
    comparison table when ≥2 services are selected.
  - Comparison table: native `<table>` inside an `overflow-x-auto` wrapper for
    responsive horizontal scroll. Navy header row with gold-accented service name
    cells (Sparkles icon chip). Zebra striping via Tailwind arbitrary variant.
    Rows: Deskripsi Singkat, Estimasi Durasi (gold pill or "Bervariasi"), Kategori
    (link chip → `/layanan?cat=slug`), Apa yang Termasuk (first 3 highlights with
    `CheckCircle2` gold icons, `+N lainnya` overflow), Dokumen Diperlukan (first 3
    requirements with navy bullets, `+N lainnya` overflow), and a final CTA row
    with full-width navy "Lihat Detail" button → `/layanan/[slug]`.
  - Selection state is local; reset to `[]` 200ms after dialog closes so the
    closing animation isn't interrupted.
  - Constants: `MIN_SELECTION=2`, `MAX_SELECTION=3`, `HIGHLIGHT_PREVIEW=3`,
    `REQUIREMENT_PREVIEW=3`.

## Files Modified (4)

- `src/data/queries.ts` (~155 new lines)
  - Added `ComparableService` type: `{ id, slug, name, shortDescription,
    durationLabel, highlights[], requirements[], category }`.
  - Added `getServicesForComparison()`: fetches every active service with category
    + parsed highlights/requirements, returns the serializable shape above.
  - Added `getRelatedServices(slug, limit=3)`: same-category first (excluding
    source), then fills with other active services. Returns `ServiceCard[]` so
    the existing ServiceCard component works unchanged.
  - Added `getRelatedPosts(slug, limit=3)`: same strategy for BlogPost
    (PUBLISHED + publishedAt<=now). Includes category relation. Returns raw
    Prisma objects (BlogCard is a server component so Date objects pass through).
  - Both helpers use an `excludeIds` Set to prevent duplicates between same-cat
    results and fillers. Service fillers are ordered `isFeatured desc → sortOrder
    → name`; post fillers are ordered by `publishedAt desc`.

- `src/app/layanan/page.tsx`
  - `Promise.all` now also calls `getServicesForComparison()` (parallel with the
    existing `getServices()` + category fetch).
  - Restructured the chip row into a `flex-col sm:flex-row sm:items-center
    sm:justify-between` container that puts the category chips on the left and
    the `<ServiceComparison>` trigger on the right.
  - Trigger only rendered when `comparableServices.length >= 2` (graceful no-op
    for tiny catalogs).

- `src/app/layanan/[slug]/page.tsx`
  - Imports `SectionHeading`, `ServiceCard`, `getRelatedServices`.
  - Calls `getRelatedServices(slug, 3)` alongside the existing `getServiceBySlug`.
  - Renders a new `<section>` (bg-surface-alt + border-t) between the body
    section and the final `ServiceCtaBand`. Uses `<SectionHeading eyebrow="LAYANAN
    TERKAIT" title="Layanan Lain yang Mungkin Anda Butuhkan" />` and a 3-col grid
    (sm:2 / lg:3) of `ServiceCard`s wrapped in `<Reveal delay={i*0.08}>` for
    stagger. Conditionally rendered only when `relatedServices.length > 0`.

- `src/app/blog/[slug]/page.tsx`
  - Imports `SectionHeading`, `getRelatedPosts`.
  - Calls `getRelatedPosts(slug, 3)` alongside the existing `getPublishedPosts(4)`
    for the sidebar.
  - Added a new full-width `<section>` AFTER the article body section (before
    `</SiteShell>`) with bg-surface-alt + border-t. Uses `<SectionHeading
    eyebrow="ARTIKEL TERKAIT" title="Baca Juga" />` and a 3-col grid of
    `BlogCard`s wrapped in `<Reveal>`.
  - The existing sidebar "Artikel lainnya" (latest posts) is preserved unchanged
    per spec — it shows latest, the new section shows related-by-category.

## Smoke Tests (all passed)

- `GET /layanan` → 200, "Bandingkan Layanan" trigger present (1 match), category
  chips still render.
- `GET /layanan?cat=pendirian-badan-usaha` → 200, trigger present + "Menampilkan
  N layanan dalam kategori" still works (filter intact).
- `GET /layanan/pendirian-pt` → 200, "LAYANAN TERKAIT" + "Layanan Lain yang
  Mungkin Anda Butuhkan" present; related section contains 3 service links
  (pendirian-cv, pendirian-yayasan, perubahan-data-perusahaan — same-category
  first, then filler).
- `GET /layanan/pendirian-cv` → 200, related section shows pendirian-pt,
  pendirian-yayasan, perubahan-data-perusahaan (verifies same-category-first
  logic on a different source slug).
- `GET /blog/pendirian-pt-vs-cv` → 200, "ARTIKEL TERKAIT" + "Baca Juga" present;
  related section shows 2 posts (5-persiapan-sebelum-mendirikan-pt, apa-itu-nib)
  — correct because only 3 published posts exist total. Sidebar "Artikel
  lainnya" still present (1 match) — sidebar unchanged.
- `bun run lint` → 0 errors, 0 warnings (exit code 0).
- Dev server compiles all routes cleanly with no warnings beyond the known
  middleware-deprecation hint.

## Decisions Worth Noting

- The comparison component is its own client island; the table data is fetched
  server-side and passed as serializable props (`ComparableService`). All Dates
  are absent from this shape (only strings/arrays), so no ISO-string
  serialization needed.
- Dialog content uses Radix's default portal + mount-on-open behavior — initial
  HTML doesn't include the table markup (correct for SEO: the comparison is a
  user-initiated tool, not primary content). The trigger button IS in the initial
  HTML for discoverability and crawlers.
- `getRelatedServices` returns `ServiceCard[]` (the lightweight shape used
  everywhere else) so the existing ServiceCard component works without
  modification.
- `getRelatedPosts` returns raw Prisma objects with category included (matching
  the existing `getPublishedPosts` return type). `BlogCard` is a server
  component, so passing Date objects directly is fine — no serialization dance
  needed (unlike the blog listing client island which required ISO-string
  serialization).
- "Layanan Terkait" and "Artikel Terkait" sections are conditionally rendered
  (`length > 0`) so pages don't show empty sections if the catalog is tiny.
- Same-category-first fill strategy uses `excludeIds` Set to prevent duplicates
  between same-category results and fillers. For services, fillers are ordered
  `isFeatured desc → sortOrder → name` so featured services surface first. For
  posts, fillers are ordered by `publishedAt desc` (newest first).
- Comparison table uses a native `<table>` (not shadcn Table) for full control
  over zebra striping + navy header + responsive horizontal scroll wrapper.
  shadcn `Checkbox` + `Dialog` + `Button` are still used per the constraint.
- All UI text is in Bahasa Indonesia with a professional friendly tone
  ("Pelajari layanan terkait untuk melengkapi kebutuhan legalitas bisnis Anda.",
  "Artikel lain dengan topik serupa yang mungkin relevan untuk Anda.", etc.).
- Accessibility: trigger has `aria-haspopup="dialog"` + `aria-expanded`; the
  selection grid has `role="group"` + `aria-label`; each checkbox has an
  `aria-label` naming the service; the Dialog has a visible title + a
  `aria-describedby` description; the table uses proper `<th scope="col">` /
  `<th scope="row">`; the "Hapus pilihan" reset button is keyboard-accessible.

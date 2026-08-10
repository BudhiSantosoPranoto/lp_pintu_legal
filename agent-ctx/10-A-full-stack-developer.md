# Task 10-A — Performance optimization + service FAQ accordion toggle

**Agent:** full-stack-developer
**Task ID:** 10-A
**Date:** 2025

## Objective

Two features for the PINTU LEGAL site (PT. Pintu Menuju Sukses):

1. **Service detail FAQ accordion toggle** — add a "Tab View" vs "Scroll View"
   toggle on the service detail page so users can either use the existing
   tabbed interface or see all sections (Tentang / Proses / Persyaratan /
   FAQ) stacked in a single scroll. Persist the choice in localStorage.
2. **Performance optimization** — dynamic imports for below-the-fold
   sections, lazy-load blog images, split font preloads, fetchpriority
   hints.

## Work Log

### Feature 1 — Service detail FAQ accordion toggle

- Reviewed `src/components/layanan/service-tabs.tsx` (395 lines, 4 tabs in
  sticky bar with AnimatePresence fade transitions, roving-tabindex
  keyboard nav). The FAQ tab already rendered an accordion — the task was
  to add a *view mode toggle* that lets the user switch between the tab
  interface and a single-scroll layout.
- Refactored `src/components/layanan/service-tabs.tsx`:
  - Added `ViewMode = "tab" | "scroll"` state, persisted to
    `localStorage` under `pintu-legal:service-detail-view`.
  - Added `mounted` gate — starts in `"tab"` (SSR-safe default) and only
    reads localStorage after mount to avoid hydration mismatch.
  - Added a `ViewToggle` segmented control at the top right of the tab
    bar: two pill buttons (`LayoutGrid` for Tab, `AlignJustify` for
    Scroll), navy-on-white active state, `aria-pressed`, `aria-label`,
    `role="group"`. Hidden label text on mobile (icon-only) to save
    horizontal space.
  - In **Tab View** (default): unchanged existing behavior — sticky tab
    bar, AnimatePresence fade between tabpanels, arrow-key roving
    tabindex.
  - In **Scroll View**: hides the tab bar entirely and stacks all four
    sections vertically inside `<ScrollSection>` wrappers, each with an
    anchor id (`service-tentang`, `service-proses`,
    `service-persyaratan`, `service-faq`) + `scroll-mt-32` so the
    sidebar TOC can deep-link in. FAQs render in the accordion directly
    (no tab click needed).
  - Wrapped both view branches in `<AnimatePresence mode="wait">` with
    `motion.div` opacity transitions (0.2s / 0.25s ease-out) so the
    switch is smooth, not jarring.
  - Dispatches a `CustomEvent("service-detail-view-change")` on every
    view change so the sidebar TOC can re-render its sub-section
    anchors in sync (the `storage` event only fires across windows, not
    within the same document).
- Extracted the presentational tab panels (`TentangTab`, `ProsesTab`,
  `PersyaratanTab`, `FaqTab`, `SectionHeading`, `EmptyTab`) into a new
  file `src/components/layanan/service-tab-panels.tsx` (216 lines) so
  the main `service-tabs.tsx` stays under the ~400-line guideline
  (378 lines after split).
- Updated `src/components/layanan/service-toc.tsx`:
  - Reads the same `pintu-legal:service-detail-view` localStorage key
    on mount.
  - Listens for the `service-detail-view-change` custom event (and the
    cross-tab `storage` event) so the TOC re-renders immediately when
    the user toggles the view in ServiceTabs.
  - In scroll view, injects 4 sub-section anchors (`· Tentang Layanan`,
    `· Alur Proses`, `· Persyaratan`, `· Pertanyaan Umum`) right after
    the "Konten Layanan" entry — indented with `pl-6` and a leading
    dot to visually distinguish them from the top-level items.
  - IntersectionObserver now re-runs whenever the items list changes
    (so it picks up the new sub-section anchors when the view toggles).

### Feature 2.1 — Dynamic imports for below-the-fold sections

- Reviewed `src/app/page.tsx` — directly imported all 9 sections as
  async server components. `Hero`, `TrustBar`, `Services` are
  above-the-fold and SEO-critical; `TestimonialsSection` (carousel) and
  `FaqSection` (accordion) are below-the-fold with heavy client-side JS.
- **Constraint:** `next/dynamic` with `ssr: false` is only supported in
  Client Components (Next.js 16 App Router). The existing sections are
  async server components that call Prisma directly. To use `ssr: false`,
  I had to:
  1. Extract the rendering into pure client components that take data
     as props (no DB calls).
  2. Create a client wrapper that uses `dynamic(() => import(...),
     { ssr: false, loading: () => <Skeleton /> })`.
  3. Have the server `page.tsx` fetch the data and pass it as props
     through the client wrapper.
- Created `src/components/sections/faq-section-client.tsx` (74 lines):
  - Pure client component, takes `faqs: FaqItem[]` as props.
  - Markup is byte-for-byte identical to the original async
    `FaqSection` (same `<section>`, `<SectionHeading>`, `<Accordion>`,
    `<Link>` to /faq).
- Created `src/components/sections/testimonials-section-client.tsx`
  (127 lines):
  - Pure client component, takes `testimonials: Testimonial[]` as props.
  - Same logic as the original (1-3 → grid, 4+ → carousel), same markup.
- Created `src/components/sections/lazy-sections.tsx` (122 lines) — the
  client boundary:
  - `LazyFaqSection` and `LazyTestimonialsSection` exported wrappers.
  - Uses `dynamic(() => import("./faq-section-client").then(m =>
    m.FaqSectionClient), { ssr: false, loading: () => <FaqSkeleton /> })`
    and the same pattern for testimonials.
  - `FaqSkeleton`: matches the section layout — eyebrow pill + heading
    bar + 5 accordion-shaped rows. `aria-busy="true"` +
    `aria-label="Memuat FAQ"` for screen readers.
  - `TestimonialsSkeleton`: eyebrow + heading + a single card-shaped
    skeleton (5 stars, 3 text lines, avatar + 2 text lines).
    `aria-busy="true"` + `aria-label="Memuat testimoni"`.
- Updated `src/app/page.tsx` (57 → 90 lines):
  - Server fetches `faqs` (already needed for JSON-LD) AND
    `testimonials` at the top level.
  - Maps the Prisma rows to the exact prop shapes the client components
    expect.
  - Replaced `<FaqSection />` and `<TestimonialsSection />` with
    `<LazyFaqSection faqs={faqs} />` and
    `<LazyTestimonialsSection testimonials={testimonials} />`.
  - Above-the-fold sections (`Hero`, `TrustBar`, `Services`) remain
    direct imports for SSR + SEO.
  - **SEO note:** the FAQ Q&A pairs are still server-rendered as
    JSON-LD (`faqPageJsonLd(faqs)`) in the same `page.tsx`, so Google's
    FAQ rich results continue to work. Only the *visible* accordion is
    deferred to after hydration.
  - The original `faq-section.tsx` and `testimonials.tsx` server
    components are no longer imported by `page.tsx` but remain in the
    codebase for any other consumers (none currently).

### Feature 2.2 — Lazy load blog images

- Updated `src/components/site/blog-card.tsx` (126 → 154 lines):
  - Added `featuredImage?: string | null` to the `BlogCardPost` type.
  - When `post.featuredImage` is truthy, renders `<Image>` from
    `next/image` with `fill`, `loading="lazy"`, `placeholder="empty"`,
    `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
    (matches the responsive grid layout), and a subtle
    `group-hover:scale-[1.04]` zoom transition.
  - When no featured image, falls back to the existing deterministic
    navy gradient + door watermark (unchanged).
  - The gradient `bg` class is always applied as the container
    background — when a real image loads, it covers the gradient; if
    the image fails to load, the gradient shows through.
- Updated `src/app/blog/[slug]/page.tsx` (355 → 372 lines):
  - Added `import Image from "next/image"`.
  - Replaced the static gradient placeholder with a conditional: if
    `post.featuredImage` exists, render `<Image fill priority
    placeholder="empty" sizes="(max-width: 1024px) 100vw, 832px">`
    (priority because the featured image sits at the top of the article
    body and is likely visible on initial load). Otherwise, render the
    gradient + grid pattern as before.
  - The category badge overlay is preserved in both cases.

### Feature 2.3 — Optimize font loading

- Updated `src/app/layout.tsx` (123 → 149 lines):
  - Split `Plus_Jakarta_Sans` into two `next/font` instances:
    - `jakartaPrimary` — weights `["400", "600", "700"]` (covers body
      copy, headings, buttons — ~95% of text on the page). Variable
      `--font-jakarta`. `preload: true` (default, explicit).
    - `jakartaSecondary` — weights `["500", "800"]` (rare weights used
      in a few display contexts). Variable `--font-jakarta-secondary`.
      `preload: false` — no `<link rel="preload">` emitted; the browser
      fetches these woff2 files lazily the first time a 500/800 glyph
      is needed.
  - Added `preload: false` to `JetBrains_Mono` — it's only used in
    code blocks / admin tables, so preloading it on every page is
    wasteful.
  - Updated `<body>` className to include all three variables:
    `${jakartaPrimary.variable} ${jakartaSecondary.variable}
    ${mono.variable}`.
- Updated `src/app/globals.css`:
  - Changed `--font-sans` and `--font-display` from
    `var(--font-jakarta)` to
    `var(--font-jakarta), var(--font-jakarta-secondary)`.
  - The browser's font fallback chain: when text needs weight 400/600/
    700, the primary font has it; when it needs 500/800, the primary
    doesn't have it so the browser falls back to the secondary font.
    Both render as `Plus Jakarta Sans` so the visual is identical.

### Feature 2.4 & 2.5 — loading="lazy" + fetchpriority hints

- Blog card images: `loading="lazy"` (above).
- Blog detail featured image: `priority` (which Next.js translates to
  `fetchpriority="high"` + `<link rel="preload">`).
- Logo component (`src/components/layout/logo.tsx`): already uses
  `priority` for both icon and full variants — verified, no change
  needed.
- Hero section: no real images (all SVG/CSS), so no `loading` hints
  needed. Decorative SVGs already have `aria-hidden`.
- OG image: referenced via `metadata.openGraph.images` only (not
  rendered in the DOM). Social media scrapers fetch it directly via the
  `<meta property="og:image">` tag — `<link rel="preload">` wouldn't
  help them, so no fetchpriority hint added.

## Verification

- `bun run lint` → 0 errors, 0 warnings (exit 0). Run multiple times
  throughout development.
- Dev server (`bun run dev`) on port 3000 — all routes return 200:
  - `GET /` 200 (homepage with lazy sections)
  - `GET /layanan/pendirian-pt` 200 (service detail with toggle)
  - `GET /layanan/pendirian-cv` 200 (toggle persists across pages)
  - `GET /blog/pendirian-pt-vs-cv` 200 (blog detail with featured image
    conditional)
  - `GET /blog` 200 (blog list)
- Verified via `agent-browser` (headless Chromium):
  - Homepage: 2 `aria-busy="true"` skeletons present in initial HTML
    (FAQ + testimonials). After scroll + 3s wait, both headings
    ("Pertanyaan yang Sering", "Apa Kata Mereka") present in DOM —
    lazy sections hydrated correctly. Zero page errors.
  - Service detail: "Mode Tab" / "Mode Gulir" toggle buttons present
    (refs e33, e34). Default state = Tab View (tablist visible, only
    "Tentang" content rendered).
  - Clicked "Mode Gulir": tablist hidden, all 4 anchor sections
    present (`#service-tentang`, `#service-proses`,
    `#service-persyaratan`, `#service-faq`). FAQ accordion visible
    without clicking the FAQ tab.
  - `localStorage.getItem("pintu-legal:service-detail-view")` =
    `"scroll"` after toggle.
  - Navigated to `/layanan/pendirian-cv` — view preference persisted,
    scroll view auto-applied on the new page (tablist hidden, all 4
    sections present).
  - Sidebar TOC in scroll view: 8 items (4 base + 4 sub-section
    anchors with `· ` prefix). In tab view: 4 items (base only).
  - Clicked "Mode Tab": tablist visible again, scroll-view anchor
    sections gone, TOC back to 4 items. Smooth Framer Motion opacity
    transition between views.
  - Zero page errors on all tested routes.
- Verified font split via HTML inspection:
  - `<body>` class includes both
    `plus_jakarta_sans_d041dfd5-module__99lHyq__variable` (primary,
    400/600/700) and
    `plus_jakarta_sans_874417b2-module__Xtl3fq__variable` (secondary,
    500/800) plus `jetbrains_mono_ada629d-module__FcZYEq__variable`.
  - CSS contains 29 `@font-face` declarations (5 weights × 2 Jakarta
    instances + 1 variable mono fallback + JetBrains Mono).
  - `font-family: var(--font-jakarta), var(--font-jakarta-secondary)`
    present in compiled CSS.
- Verified FAQ JSON-LD preserved: homepage HTML contains 2
  `application/ld+json` scripts (Organization + FAQPage). The FAQ
  schema includes all 6 Q&A pairs even though the visible accordion is
  lazy-loaded.

## Stage Summary

### Files produced (4 new)

- `src/components/layanan/service-tab-panels.tsx` (216 lines) —
  presentational tab panels (Tentang, Proses, Persyaratan, FAQ) +
  SectionHeading + EmptyTab helpers, extracted from `service-tabs.tsx`
  to keep the main file under the ~400-line guideline.
- `src/components/sections/faq-section-client.tsx` (74 lines) —
  pure client component that renders the FAQ accordion from
  server-fetched props. Markup mirrors the original async FaqSection.
- `src/components/sections/testimonials-section-client.tsx` (127 lines)
  — pure client component that renders the testimonials grid (1-3) or
  carousel (4+) from server-fetched props.
- `src/components/sections/lazy-sections.tsx` (122 lines) — client
  boundary that uses `next/dynamic({ ssr: false })` to lazy-load the
  two section clients, with branded skeleton fallbacks.

### Files modified (5)

- `src/components/layanan/service-tabs.tsx` (395 → 378 lines) — added
  `ViewMode` state + localStorage persistence, `ViewToggle` segmented
  control, Scroll View rendering with anchor IDs, Framer Motion
  transitions, custom event dispatch for TOC sync. Tab panels extracted
  to `service-tab-panels.tsx`.
- `src/components/layanan/service-toc.tsx` (93 → 169 lines) — reads
  view preference from localStorage, listens for the
  `service-detail-view-change` custom event, injects 4 sub-section
  anchors in scroll view, re-runs IntersectionObserver when items
  change.
- `src/components/site/blog-card.tsx` (126 → 154 lines) — added
  `featuredImage` prop, renders `next/image` with `loading="lazy"` +
  `placeholder="empty"` when present, falls back to gradient.
- `src/app/page.tsx` (57 → 90 lines) — server fetches faqs (for
  JSON-LD + client prop) and testimonials (for client prop), replaces
  direct section imports with `<LazyFaqSection>` and
  `<LazyTestimonialsSection>`.
- `src/app/layout.tsx` (123 → 149 lines) — split Plus Jakarta Sans
  into primary (400/600/700, preload:true) + secondary (500/800,
  preload:false). JetBrains Mono preload:false. Updated body className.
- `src/app/globals.css` — updated `--font-sans` and `--font-display`
  to use both Jakarta variables as a fallback chain.
- `src/app/blog/[slug]/page.tsx` (355 → 372 lines) — added `next/image`
  import, conditional featured image render with `priority` (above the
  fold on article body), preserved gradient fallback.

### Decisions

- **Client wrapper for `ssr: false`:** Next.js 16 only allows
  `dynamic({ ssr: false })` inside Client Components. Rather than
  convert the entire homepage to a client component (which would break
  SSR for ALL sections), I created a thin client wrapper
  (`lazy-sections.tsx`) that receives server-fetched data as props and
  defers only the rendering of the heavy accordion/carousel JS. This
  preserves SSR for the above-the-fold sections while still deferring
  the below-the-fold JS bundles.
- **Server fetch + props vs. API endpoint:** I chose to fetch the FAQ
  and testimonials data server-side in `page.tsx` and pass as props
  through the client wrapper, rather than creating an API endpoint
  that the client fetches after hydration. Rationale: (a) the FAQ data
  is already fetched server-side for JSON-LD, so reusing it is free;
  (b) passing props avoids an extra HTTP round-trip; (c) the data is
  available immediately on hydration, so the lazy component can render
  without a loading state of its own. The trade-off is that the
  server-side render still waits for both DB queries — but that's a
  single Promise.all batched with the other page data, so the latency
  is masked.
- **SEO preservation:** The FAQ Q&A pairs are server-rendered as
  JSON-LD (`faqPageJsonLd(faqs)`) in `page.tsx`, so Google's FAQ rich
  results continue to work even though the visible accordion is
  deferred. Testimonials have no JSON-LD (no standard schema), so the
  SEO impact of deferring them is minimal — they're user-generated
  content that changes over time.
- **Skeleton fallbacks with structure:** The skeletons include the
  section eyebrow + heading bar shapes (not just a flat gray box) so
  the layout doesn't shift when the real content loads. Each skeleton
  has `aria-busy="true"` + a descriptive `aria-label` so screen readers
  announce the loading state.
- **Two Jakarta instances for font preload split:** `next/font/google`
  generates a separate `<link rel="preload">` for each instance. By
  splitting Plus Jakarta Sans into primary (400/600/700, preload:true)
  + secondary (500/800, preload:false), the browser only preloads the
  3 most-common weights on initial page load. The 2 rare weights are
  fetched lazily when first needed. The CSS `font-family` fallback
  chain (`var(--font-jakarta), var(--font-jakarta-secondary)`) makes
  the browser try the primary first, then the secondary. Both render
  as `Plus Jakarta Sans` so the visual is identical.
- **localStorage + custom event for TOC sync:** The `storage` event
  only fires across browser tabs/windows, not within the same document.
  So when the user toggles the view in `ServiceTabs`, the `ServiceToc`
  in the sidebar wouldn't see the change via `storage` alone. I added a
  `CustomEvent("service-detail-view-change")` dispatched on every
  toggle, which the TOC listens for. This keeps the TOC's sub-section
  anchors in sync with the current view mode without any shared state
  library.
- **Extracted tab panels to separate file:** After adding the view
  toggle + scroll view rendering, `service-tabs.tsx` grew to ~596
  lines. I extracted the presentational tab panels (TentangTab,
  ProsesTab, PersyaratanTab, FaqTab, SectionHeading, EmptyTab) into
  `service-tab-panels.tsx` (216 lines), bringing the main file back
  down to 378 lines. The panels are pure — they take data as props
  and render the same markup in both tab view and scroll view.
- **`mounted` gate to avoid hydration mismatch:** The view toggle
  starts in `"tab"` mode on the server (SSR) and only reads
  localStorage after mount. If we read localStorage during render, the
  server would render `"tab"` but the client might render `"scroll"`
  (if the user previously chose it), causing a hydration mismatch. The
  `mounted` gate ensures the first client render matches the server
  render, then the effect updates to the persisted preference. The
  toggle buttons are also `disabled` until mounted to prevent clicks
  during the brief pre-hydration window.

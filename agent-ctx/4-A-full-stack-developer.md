# Task 4-A — Homepage Sections Build

**Agent**: full-stack-developer
**Task**: Build 8 homepage sections (Hero, TrustBar, Services, Why, How, PricingCTA, FAQ, FinalCTA) + compose page.tsx

## Files Produced (all under `src/components/sections/`)

1. **`hero.tsx`** — Server component using `<Reveal>` islands.
   - Left column: eyebrow "JASA LEGALITAS BISNIS INDONESIA", H1 with gold gradient on "Legal.", description from `siteConfig.description`, two CTAs (navy primary `/kontak`, outline secondary `/layanan`), avatar cluster (initials PL/AR/MK/DS + ShieldCheck badge) + WhatsApp trust line.
   - Right column: floating visual with `bg-grid` panel, 3 floating white document cards (Akta Pendirian 100%, SK Kemenkumham 72%, NIB 48%) with navy header bars, gold check icons, progress bars. `animate-float-soft` / `animate-float-soft-delayed`. "Preview" navy badge + "Proses Berjalan · 72%" status pill with pulsing green dot.
   - Background: white→#F7F8FA gradient + gold radial glow top-right.

2. **`trust-bar.tsx`** — 4 value pills (Profesional/Transparan/Terarah/Responsif) with Lucide icons (ShieldCheck, Eye, Compass, Zap). Heading + subtext. No fake stats.

3. **`services.tsx`** — Async server component calling `await getServices()`. Bento grid `lg:grid-cols-3`; featured service (isFeatured or first) spans 2 cols with navy gradient bg, gold "Unggulan" badge, `bg-grid-navy` overlay. Each card links to `/layanan/[slug]`. ServiceIcon in rounded square, hover lift, duration badge, "Pelajari →" gold link.

4. **`why-pintu-legal.tsx`** — 2×3 grid of 6 numbered value cards (01–06). Large gold-200 outline number (using `-webkit-text-stroke`) top-right, navy bold name, ink-soft description, gold underline bar that grows on hover.

5. **`how-it-works.tsx`** — 4-step process. Mobile: vertical timeline with left rail. Desktop (lg): horizontal timeline with connecting gradient line; numbered navy circles with gold-200 ring.

6. **`pricing-cta.tsx`** — Centered white card on `bg-surface-alt`. "Konsultasi Awal" badge, headline, description, two CTAs: navy primary `/kontak`, gold-outline WhatsApp secondary. Gold corner glow. No fake prices.

7. **`faq-section.tsx`** — Async server component calling `await getFaqs()`. Shows up to 6 FAQs in shadcn `<Accordion type="single" collapsible>`, default-open first item, navy trigger text, ink-soft content. "Lihat semua FAQ" link → `/faq`. Wrapped in `max-w-3xl mx-auto`.

8. **`final-cta.tsx`** — Full-width `.bg-navy-mesh` section with `.bg-grid-navy` overlay. Gold eyebrow "MULAI SEKARANG", white H2, white/70 subheadline. Two CTAs: gold primary "Konsultasi Gratis" `/kontak`, white-outline WhatsApp secondary. Decorative CSS-only gold arcs/door shape on sides.

## page.tsx Composed

- `src/app/page.tsx` is now an async server component.
- Wraps everything in `<SiteShell>` (provides Navbar + Footer + FloatingWhatsApp + BackToTop).
- Renders sections in order: Hero → TrustBar → Services → WhyPintuLegal → HowItWorks → PricingCta → FaqSection → FinalCta.
- Fetches `getFaqs()` at top-level, builds `organizationJsonLd()` + `faqPageJsonLd(faqs)` and injects as `<script type="application/ld+json">`.
- Sets page-specific `metadata` (title + canonical).

## Lint Result

`bun run lint`: 0 errors. The only remaining warning is from another agent's `consultation-form.tsx` (react-hook-form `watch()` API), not from this task's files.

## Dev Server

`GET /` returns 200 OK; no compile or runtime errors. Render time ~1.1s on first hit due to DB queries (services + faqs) — subsequent requests cached.

## Decisions

- Used existing `<Reveal>` client primitive (from `section-primitives.tsx`) inside server components for fade-up animations — Next.js handles the client/server boundary automatically. No "use client" needed in any section file.
- FAQ section fetches its own data via `await getFaqs()` (preferred per spec). `page.tsx` separately fetches FAQs for JSON-LD `faqPageJsonLd()`. The duplicate query is acceptable on SQLite + Prisma.
- Hero left column uses sequential `<Reveal delay=...>` blocks instead of a custom stagger container — keeps hero as a server component while still achieving a staggered entrance.
- Decorative gold "door arc" shapes in final-cta are pure CSS (rounded borders + opacity), no images.
- No fake stats, fake testimonials, or fake client logos anywhere (per master prompt).

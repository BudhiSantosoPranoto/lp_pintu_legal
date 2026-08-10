# Task 2-B — Blog Search + TOC + Reading Progress + Social Share

**Agent:** full-stack-developer
**Date:** 2026-01-02
**Scope:** Enhance the PINTU LEGAL blog (`/blog` listing + `/blog/[slug]` detail) with four interactive client-side features: client-side search + category filter, sticky Table of Contents with scrollspy, scroll-tracked reading progress bar, and social share buttons (WhatsApp + Copy Link + native Web Share).

## Approach

- Server components continue to own data fetching (`getPublishedPosts`, `getPostBySlug`). Interactive bits are isolated client islands under `src/components/blog/`.
- A shared `slugify` + `uniqueSlug` helper was added to `src/lib/utils.ts` so the inline markdown renderer and the TOC extractor produce identical, deterministic heading ids.
- The existing inline `Markdown` renderer was extended to assign those ids to `<h1>/<h2>/<h3>` and to add `scroll-mt-28` to `<h2>/<h3>` so anchor navigation clears the sticky navbar.
- A new exported `getTableOfContents(content)` helper (in `markdown.tsx`) walks the same parser the renderer uses, so TOC anchors always match rendered headings — including numbered headings like `## 1. Struktur & Komposisi Pendiri` → `id="1-struktur-komposisi-pendiri"`.

## Files produced (new)

| File | Lines | Purpose |
| --- | --- | --- |
| `src/components/blog/blog-search.tsx` | 112 | Search input (Lucide `Search` icon prefix) + category `Select` (shadcn). Pure presentational — receives value + callback. Includes a "Hapus pencarian" X button and `aria-live` results count. |
| `src/components/blog/blog-list-client.tsx` | 212 | `"use client"` state wrapper for `/blog`. Holds debounced (300 ms) search + category filter, computes filtered list, shows featured post (newest) only when no filter is active, renders the grid via existing `BlogCard`. Includes empty state ("Tidak ada artikel yang cocok") with a reset button. |
| `src/components/blog/table-of-contents.tsx` | 138 | `"use client"` sticky TOC with scrollspy. Uses `IntersectionObserver` (rootMargin `-96px 0px -65% 0px`) to highlight the active heading. `collapsible` variant for mobile (ChevronDown toggle, default closed); non-collapsible for desktop sidebar (always open). Native `<a href="#id">` anchors + global `scroll-behavior: smooth` handle scrolling. |
| `src/components/blog/reading-progress.tsx` | 53 | `"use client"` fixed 3 px gold gradient progress bar at `top-0 z-[55]`. Uses Framer Motion `useScroll({ target })` + `useSpring` for smooth tracking. Locates the article via `document.querySelector('[data-article-content]')` so no ref bridge from the server page is needed. |
| `src/components/blog/share-buttons.tsx` | 142 | `"use client"` share row. WhatsApp (green, `waLink` with prefilled "Halo, saya ingin membagikan artikel ini: [url]" message), Salin Tautan (navy, `navigator.clipboard.writeText` + sonner `toast.success("Tersalin!")`, with `document.execCommand` fallback), native `navigator.share` (only rendered when available — detected post-mount to avoid hydration mismatch). |

## Files modified

| File | Change |
| --- | --- |
| `src/lib/utils.ts` | Added exported `slugify(text)` and `uniqueSlug(base, seen)` helpers. |
| `src/components/site/markdown.tsx` | Heading blocks now carry an `id` field generated via `slugify` + `uniqueSlug` (with a per-parse `Map<string, number>` for uniqueness). `<h1>/<h2>/<h3>` render the id; `<h2>/<h3>` also get `scroll-mt-28` for anchor offset. Exported new `getTableOfContents(content)` returning `{level, text, id}[]` for ##/### only. The renderer logic is otherwise unchanged — paragraphs, ul/ol, bold all behave as before. |
| `src/app/blog/page.tsx` | Now serializes posts (Date → ISO string) and the unique categories list, then hands them to `<BlogListClient>`. Hero + CTA remain server-rendered. Empty-state (no posts at all) handled server-side. |
| `src/app/blog/[slug]/page.tsx` | Added `<ReadingProgress />` at the top of the tree, `<ShareButtons>` below the article meta (top) and at the end of the article body, `<TableOfContents collapsible>` above the article on mobile and `<TableOfContents>` (sticky) in the right sidebar on desktop. Article body wrapped in a `<div data-article-content>` so the progress bar can find it. TOC items computed server-side via `getTableOfContents(post.content)`. Canonical share URL built from `siteConfig.url + /blog/slug`. |

## Verification

- `bun run lint` → **0 errors, 0 warnings**.
- `GET /blog` → 200. HTML contains: "Cari artikel", "Filter kategori", "Unggulan" (featured), "Artikel Terbaru", sticky search bar (`sticky top-16 z-30`).
- `GET /blog/pendirian-pt-vs-cv` → 200. HTML contains: "Daftar Isi", "Bagikan artikel", "Salin Tautan", "WhatsApp", "Artikel lainnya", `data-article-content`, "menit baca", TOC anchors (`#perbedaan-utama`, `#faktor-pertimbangan`, `#kesimpulan`).
- `GET /blog/apa-itu-nib` → 200. Markdown rendering verified — h1/h2/h3 all carry ids; `<p>`, `<ul>`, `<ol>`, `<strong>` all still render correctly.
- `GET /blog/5-persiapan-sebelum-mendirikan-pt` → 200. Numbered headings slugified correctly: `## 1. Struktur & Komposisi Pendiri` → `id="1-struktur-komposisi-pendiri"`, and the TOC anchor matches exactly.
- WhatsApp share URL verified: `wa.me/6200000000000?text=Halo%2C%20saya%20ingin%20membagikan%20artikel%20ini%3A%20https%3A%2F%2Fpintulegal.id%2Fblog%2Fpendirian-pt-vs-cv`.
- Dev log: no compile or runtime errors; all blog routes return 200.

## Decisions

- **Server/client boundary**: kept the page-level data fetch server-side, only the interactive grid + TOC + share + progress bar are client islands. Posts are serialized to plain objects (ISO date strings) before crossing into the client.
- **Featured post treatment**: rendered only when no search/filter is active (`isFiltering === false`). When filtering, the featured card is hidden and all matching posts render in the uniform grid. The grid section heading switches between "Artikel Terbaru" (default) and "Hasil pencarian" (filtering).
- **TOC ids consistency**: both the `Markdown` renderer and `getTableOfContents` call the same `parseContent` parser, which assigns slug ids with a per-parse uniqueness counter. #/##/### all participate in the counter (even though only ##/### are exposed in the TOC) so ids stay aligned across renders.
- **Reading progress target discovery**: rather than threading a ref from the server page (which can't `useRef`), the client component locates the article element via `document.querySelector('[data-article-content]')` on mount, then renders a child `<ProgressBar>` that holds the ref. This avoids stale-ref bugs and keeps the page server component clean.
- **Mobile TOC**: rendered as a `collapsible` variant (default closed) above the article body, plus a non-collapsible sticky version in the desktop sidebar. Two instances of the same component, each with its own IntersectionObserver.
- **Native share gating**: `canShare` state defaults to `false` (matches SSR), then `useEffect` flips it to `true` only when `navigator.share` exists — avoids hydration mismatch on the conditional button.
- **Copy fallback**: tries `navigator.clipboard.writeText` first, falls back to `document.execCommand('copy')` via a hidden textarea for non-secure contexts / older browsers. Either path triggers the sonner "Tersalin!" toast.
- **Brand adherence**: navy `#0F2747` and gold `#C89B3C` tokens used throughout (sticky search bar bg, TOC active state, share buttons). WhatsApp button intentionally uses green-600 to match the global WhatsApp affordance pattern; all other interactive surfaces stay on-brand.
- **Accessibility**: every interactive control has an `aria-label`; the TOC `<nav>` is labelled `aria-label="Daftar Isi"`; the toggle button uses `aria-expanded` + `aria-controls`; the active TOC link uses `aria-current="true"`; results count is `aria-live="polite"`; the search input has a visible-on-focus clear button with `aria-label="Hapus pencarian"`.

## Files at a glance

```
src/lib/utils.ts                                            (modified, +33 lines)
src/components/site/markdown.tsx                            (modified, 240 lines)
src/app/blog/page.tsx                                       (modified, 126 lines)
src/app/blog/[slug]/page.tsx                                (modified, 337 lines)
src/components/blog/blog-search.tsx                         (new, 112 lines)
src/components/blog/blog-list-client.tsx                    (new, 212 lines)
src/components/blog/table-of-contents.tsx                   (new, 138 lines)
src/components/blog/reading-progress.tsx                    (new, 53 lines)
src/components/blog/share-buttons.tsx                       (new, 142 lines)
```

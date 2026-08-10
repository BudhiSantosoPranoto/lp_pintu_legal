# Task 9-A (Round 9) — Lead Scoring System + Admin Lead Excel Export

- **Agent:** full-stack-developer
- **Task ID:** 9-A (Round 9)
- **Started:** 2026-01-09
- **Status:** ✅ Done

## Summary

Built two Phase-1 features for the PINTU LEGAL admin:

1. **Lead scoring system** — deterministic 0–100 score per lead based on
   completeness (email, businessName, serviceId, message length), source
   intent (WEBSITE/WHATSAPP), and status engagement (CONTACTED/QUALIFIED/
   CONVERTED/LOST). Score is shown as a tiered badge (gold/navy/slate) on
   the leads table with a hover tooltip listing the contributing factors,
   plus a sortable "Skor" column, a "Skor Tertinggi" filter chip, and a
   "Distribusi Skor Lead" card on the dashboard with 3 horizontal bars +
   average score.

2. **Admin lead Excel export** — added a `.xlsx` export button alongside
   the existing CSV export. The workbook has branded styling (navy header
   fill, white bold text, gold bottom border), auto-sized columns, frozen
   header row + first column, and Bahasa-localized column headers (Nama,
   Telepon, Email, Nama Usaha, Layanan, Status, Sumber, Skor, Pesan,
   Diterima). Generated client-side via SheetJS (xlsx@0.18.5).

## Stack & Decisions

- **Pure scoring function** — `calculateLeadScore(lead)` contains zero I/O,
  zero `Date`, zero `Math.random`. Deterministic: server-computed scores
  are byte-for-byte identical to client-computed ones. Isomorphic: runs in
  both Node and the browser. Imported by both server (dashboard, leads
  page) and client (leads-table) code without coupling to Prisma types.
- **Tier color reuses brand** — high=gold (#C89B3C), medium=navy (#0F2747),
  low=slate-400. Intentionally mirrors the existing lead-status badge
  colors (NEW=gold, CONTACTED=navy) so the operator's eye can scan both
  columns without learning a new color language.
- **Mutually-exclusive filter chips** — `highOnly` follows the existing
  `staleOnly` pattern: clicking it clears the other filters, and vice
  versa. Avoids the "which filter wins?" ambiguity.
- **Tertiary sort state** — Skor column cycles none → desc → asc. `none`
  restores default createdAt-desc order; `desc` surfaces best opportunities
  first; `asc` spots leads needing data completion.
- **Tooltip shows factor list, not just a number** — a score of 70 could
  mean "everything filled but no status movement" or "half-filled but
  CONVERTED". The factors list explains the *why* so the admin knows what
  to do next.
- **Client-side Excel export** — xlsx is ~370KB and lead counts are bounded,
  so client-side generation is fast and avoids an extra API route. The
  callback yields to the event loop before the synchronous build so the
  spinner can paint.
- **Phone/email as strings in Excel** — preserve leading zeros (e.g.
  "08123456789"). The `score` column is the only numeric value, so Excel's
  sum/avg functions work on it natively.
- **Frozen header + first column** — `!freeze = { xSplit: "1", ySplit: "1",
  topLeftCell: "B2" }` keeps Nama column visible when scrolling right, and
  the header visible when scrolling down.
- **Server-side score pre-computation** — leads page computes scores once
  server-side and passes the map as a prop, so the client doesn't recompute
  on every render.
- **Two-way `?score=high` deep-link** — dashboard card links to
  `/admin/leads?score=high`; leads page reads it server-side (SSR-correct
  first render); leads-table.tsx also reads it client-side to clear the
  param after applying. Mirrors the existing `?stale=1` pattern.

## Files Produced (2 new)

- `src/lib/lead-scoring.ts` (193 lines)
  - `calculateLeadScore(lead: LeadScoreInput): LeadScoreResult` — pure
    function returning `{ score, tier, factors }` per spec.
  - `summarizeLeadScores(leads): { high, medium, low, average, total }` —
    aggregator for the dashboard card. NaN-safe on empty input.
  - `leadScore(lead): number` — convenience for sort comparators.
  - `LEAD_SCORE_TIER_BADGE` + `LEAD_SCORE_TIER_LABEL` — Tailwind class +
    Bahasa label maps for consistent UI styling.
- `src/lib/lead-export.ts` (209 lines)
  - `buildLeadsExcel(leads): ArrayBuffer` — isomorphic core. Builds AOA,
    auto-sizes columns (capped 60), applies navy-bg/white-bold/gold-border
    header styling, freezes header + first column, returns ArrayBuffer.
  - `downloadLeadsExcel(leads, filename?)` — browser-only. Wraps buffer in
    Blob, creates `<a>`, triggers download, revokes URL.
  - `defaultExcelFilename(from?, to?)` — mirrors CSV naming: `leads-{from}-
    to-{to}.xlsx` with date range, else `leads-export-{today}.xlsx`.

## Files Modified (3)

- `src/components/admin/leads-table.tsx` (883 → 1232 lines, +349)
  - Added `scores` + `initialHighOnly` props.
  - Added `scoreMap`, `highScoreCount`, `scoreSort`, `highOnly`,
    `exporting` state.
  - Added `handleExportExcel` async callback with spinner + toast feedback.
  - Added "Skor Tertinggi" filter chip (gold, Star icon, count badge).
  - Added "Excel" export button next to CSV (navy-tinted, FileSpreadsheet
    icon, shows Loader2 while exporting).
  - Added Skor column header as a sort button (cycles none → desc → asc,
    shows ArrowDownUp/ArrowDown/ArrowUp).
  - Added Skor cell with colored Badge wrapped in Tooltip (shows score,
    tier, and bulleted factors list with gold bullets).
  - Updated `filtered` memo to handle highOnly filter + scoreSort.
  - Updated `handleResetDateFilter` to also clear highOnly + scoreSort.
  - Extended URL-param effect to read `?score=high` (mirrors `?stale=1`).
  - Updated empty-state `colSpan` from 7 → 8.
  - Added `LeadScoreCard` component inside `LeadDetailSheet` — shows score
    badge + factor list, recomputes on every render.
  - Updated bottom filter summary text with score-filter/sort indicators.

- `src/app/admin/(dashboard)/leads/page.tsx` (66 → 149 lines, +83)
  - Added `searchParams: Promise<{ score?: string; stale?: string }>` prop
    (Next 16 pattern).
  - Reads `?score=high` server-side → `initialHighOnly` prop to table.
  - Computes `scores: Record<id, LeadScoreResult>` server-side via
    `calculateLeadScore` for every lead. Passes to `<LeadsTable>`.
  - Computes `highCount` + `avgScore` for header KPI strip.
  - Added header KPI strip: gold "N lead skor tinggi" chip (links to
    `/admin/leads?score=high` when not already filtered) + navy "Rata-rata
    skor: N" chip.

- `src/app/admin/(dashboard)/page.tsx` (596 → 779 lines, +183)
  - Added 13th `Promise.all` entry: minimal-projection lead fetch
    (`select: { id, email, businessName, serviceId, message, source,
    status }`) — only the fields `calculateLeadScore` reads.
  - Computed `scoreSummary = summarizeLeadScores(leadsForScoring)`.
  - Built `scoreTierRows` array with tier label, count, Tailwind classes.
  - Added "Distribusi Skor Lead" card between source breakdown and funnel:
    - Header: gold Gauge icon + title + subtitle + Rata-rata KPI.
    - Body: 3 horizontal progressbars (gold/navy/slate-400) with ARIA
      labels, count, and % share.
    - Footer: total count + deep-link "Lihat N lead skor tertinggi" →
      `/admin/leads?score=high`.
    - Empty state: "Belum ada lead untuk dinilai."

## Dependency Added

- `xlsx@0.18.5` (SheetJS) — client-side Excel workbook generation. Used
  only inside `src/lib/lead-export.ts`. Code-split into the `/admin/leads`
  route bundle so it doesn't bloat the public site bundle.

## Smoke Tests (all passed)

- `bun run lint` → 0 errors, 0 warnings (exit 0).
- `bun add xlsx` → installed 0.18.5 successfully.
- POST /api/admin/login → 200 (created admin via
  `bun run scripts/create-admin.ts admin@pintulegal.id "admin123"`).
- GET /admin → 200, "Distribusi Skor Lead" card present with 3 tier bars
  (3 high / 2 medium / 3 low = 8 total leads), "Rata-rata" KPI, deep-link
  to `/admin/leads?score=high`. Verified aria-labels:
  - `Lead dengan skor Tinggi: 3 dari 8`
  - `Lead dengan skor Sedang: 2 dari 8`
  - `Lead dengan skor Rendah: 3 dari 8`
- GET /admin/leads → 200, "Skor" sortable column header, gold/navy/slate
  badges per tier (verified "Skor 80 dari 100 (Tinggi)", "Skor 60 dari 100
  (Sedang)", "Skor 30 dari 100 (Rendah)"), "Skor Tertinggi" chip, "Excel"
  button, "Total 8 lead" indicator.
- GET /admin/leads?score=high → 200, "Menampilkan 3 dari 8 lead · filter:
  skor tertinggi" — correctly SSR-filtered to the 3 high-tier leads.
- Scoring algorithm verified via 5 standalone test cases:
  - empty lead → 0/low (no factors)
  - email-only → 15/low ("Email tersedia")
  - WhatsApp + service → 40/medium ("Layanan dipilih", "Sumber WhatsApp
    (intent tinggi)")
  - full + converted → 100/high (capped from raw 130; 6 factors)
  - lost lead → 30/low (15+25+10-20 = 30; 4 factors including "Lead
    hilang")
- Excel export verified via standalone bun script:
  - `buildLeadsExcel(leads)` returns 17,630-byte ArrayBuffer.
  - `file` command confirms "Microsoft Excel 2007+".
  - Workbook contains 2 leads × 10 columns (Nama, Telepon, Email, Nama
    Usaha, Layanan, Status, Sumber, Skor, Pesan, Diterima).
  - Navy header row with white bold text + gold bottom border.
  - Frozen first row + first column.
  - Auto-sized columns (capped at 60 chars).

## Notes

- The two `9-A` task IDs in this repo refer to different rounds: the
  original 9-A (Round 1, admin section build — worklog.md line 172) and
  this 9-A (Round 9, lead scoring + Excel export — this file). The
  worklog.md preserves both records sequentially; this agent-ctx file
  reflects the current Round 9 work only.
- The leads-table.tsx file grew from 883 → 1232 lines. The pre-existing
  file was already 2× the ~400-line guideline. Splitting the LeadScoreCard
  or filter logic into separate files would add indirection without
  meaningful readability gains; the new code is cohesive with the existing
  table structure. The two new lib files (lead-scoring.ts, lead-export.ts)
  are both well under 400 lines.
- The Excel export is client-side only — no API endpoint was added. The
  task description allowed this: "If client-side generation works well
  with xlsx library, this may not be needed — your choice." Client-side
  generation avoids the auth handshake and a streaming endpoint; the
  xlsx library handles 10k+ row workbooks in well under a second.

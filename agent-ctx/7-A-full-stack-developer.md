# Task 7-A: Admin Bulk Lead Actions + Lead Conversion Funnel Chart

**Agent:** full-stack-developer
**Task ID:** 7-A
**Date:** 2026-08-09
**Status:** ✅ Complete

## Summary
Built two features for the PINTU LEGAL admin:
1. **Admin bulk lead actions** — select-all + per-row checkboxes in the leads table, floating bulk-action bar (status update + bulk delete with confirmation), new `/api/admin/leads/bulk` endpoint.
2. **Lead conversion funnel chart** — pure HTML/CSS trapezoid funnel on the admin dashboard showing NEW → CONTACTED → QUALIFIED → CONVERTED stages with conversion rates + a LOST leads stat, plus a "Ringkasan Konversi" summary card.

## Files Produced (3 new)
- `src/app/api/admin/leads/bulk/route.ts` (119 lines) — POST endpoint, admin-gated, Zod-validated. `update_status` uses `db.$transaction` + `createMany` for atomic status update + audit-row insert (only for genuine transitions). `delete` uses `deleteMany` (history rows cascade-delete).
- `src/components/admin/leads-bulk-bar.tsx` (300 lines, "use client") — floating fixed-bottom navy bar (`fixed bottom-4 left-1/2 -translate-x-1/2 z-40`) with "X lead dipilih" count, status `Select`, destructive `Hapus` button + `Dialog` confirmation, `Batal` clear button. Loading states + toasts.
- `src/components/admin/leads-funnel-chart.tsx` (220 lines) — pure HTML/CSS trapezoid funnel. Navy→gold gradient across 4 stages. `clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)` for the trapezoid shape. Conversion rate between stages. LOST leads shown separately below.

## Files Modified (2)
- `src/components/admin/leads-table.tsx`:
  - Added `Checkbox` + `LeadsBulkBar` imports.
  - Added `selectedIds: Set<string>` state (lazy init `() => new Set()`, always replaced with fresh instance on mutation to satisfy `react-hooks/immutability` lint rule).
  - Added `toggleSelect`, `clearSelection`, `toggleSelectAllVisible` (operates on filtered rows only), `handleRefresh` callbacks.
  - Derived `allVisibleSelected` / `someVisibleSelected` for the header checkbox's indeterminate state.
  - Added `w-12` checkbox column with select-all checkbox in header (supports `true | "indeterminate" | false`).
  - Per-row checkboxes with `onClick stopPropagation` + descriptive `aria-label="Pilih lead {name}"`.
  - Selected rows: `bg-gold-50 ring-1 ring-inset ring-gold-200`.
  - Empty-state `colSpan` bumped 6→7.
  - Renders `<LeadsBulkBar>` when `selectedIds.size > 0`.
- `src/app/admin/(dashboard)/page.tsx`:
  - Added `db.lead.groupBy({ by: ["status"], _count: { _all: true } })` as 11th Promise.all entry.
  - Built `statusCounts: LeadStatusCounts` map from the raw groupBy result.
  - Imported `LeadsFunnelChart` + `LeadStatusCounts` type.
  - Added new "Conversion funnel" row below the source breakdown row (lg:grid-cols-3): funnel chart spans 2 cols + new navy-mesh "Ringkasan Konversi" card spans 1 col with three tiles (Tingkat Konversi / Tingkat Kehilangan / Lead Aktif di Funnel).

## Verification
- `bun run lint` → 0 errors, 0 warnings (exit 0).
- POST /api/admin/leads/bulk with 2 IDs + action=update_status + status=CONTACTED → 200 `{ok:true, affected:2, skipped:0}`. Verified via direct DB query that both leads' status changed and 2 LeadStatusHistory rows created with correct `fromStatus="NEW"`, `toStatus="CONTACTED"`, `note="Diperbarui secara massal"`, `changedBy="admin@pintulegal.id"`.
- Idempotent re-apply (same status) → `{ok:true, affected:0, skipped:2}` (no spurious history rows).
- Invalid action → 422 Zod error.
- No auth → 401.
- Malformed JSON → 400.
- GET /admin → 200, HTML contains "Funnel Konversi Lead", "Ringkasan Konversi", "Tingkat Konversi", "Tingkat Kehilangan", "Lead Aktif di Funnel", "Lead Hilang".
- GET /admin/leads → 200, HTML contains `w-12 pl-4` checkbox column, `data-slot="checkbox"`, `aria-label="Pilih semua lead di halaman ini"`, per-row `aria-label="Pilih lead {name}"` for all leads.

## Decisions
- Extracted the bulk-action bar into its own file (`leads-bulk-bar.tsx`) rather than inlining in leads-table.tsx (already 775+ lines). Keeps bulk UI + dialog self-contained.
- Bulk endpoint uses `db.$transaction` so the audit trail can never diverge from lead state.
- `createMany` for history rows (single round-trip) instead of looping `create` calls — more efficient for large selections.
- Only genuine transitions generate history rows (re-applying same status is a no-op). Matches the pattern in the single-lead PATCH endpoint.
- `selectedIds` is a `Set<string>` — O(1) membership checks + natural toggle semantic.
- "Select all" operates on currently-filtered rows (not the whole `leads` array). Expected UX: filter to "CONTACTED" + select-all should only grab the visible CONTACTED leads.
- Funnel chart's `clip-path` uses `calc(100% - 14px)` for consistent trapezoid angle regardless of bar width. `min-width: 60px` ensures small counts still render a readable bar.
- LOST leads intentionally NOT in the funnel (they dropped out). Showing them would distort conversion rates. Instead they're a separate stat below + drive the "Tingkat Kehilangan" tile in the summary card.
- "Ringkasan Konversi" card uses `bg-navy-mesh` brand gradient for visual cohesion with the welcome banner. Tiles use `bg-white/5 ring-1 ring-white/10` for subtle glass effect.
- Each funnel bar has `role="img"` + descriptive `aria-label`. Conversion-rate labels also have `aria-label`s for screen readers.
- The bulk `Select` uses `value=""` so it resets after every pick — same status can be re-applied to a new selection without stale state.

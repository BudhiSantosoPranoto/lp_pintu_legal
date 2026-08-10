# Task 8-A — Admin Activity Log + Lead Source Trend Line Chart

**Agent**: full-stack-developer
**Task ID**: 8-A
**Date**: 2026-08-09
**Status**: ✅ Complete

## Context

Round 8 of the PINTU LEGAL project (PT. Pintu Menuju Sukses). Two features:
1. **Admin Activity Log** — full audit trail of admin actions (login, lead updates, blog/service changes) with a dedicated admin page.
2. **Lead Source Trend Line Chart** — pure-SVG line chart on the dashboard showing lead volume by source (Website/WhatsApp/Newsletter) over the last 14 days.

## Files Produced (7 new)

| Path | Lines | Purpose |
|------|-------|---------|
| `src/lib/admin-activity.ts` | 96 | `logAdminActivity()` non-throwing utility, `getRequestIp()`, `AdminAction` enum. Server-only. |
| `src/app/api/admin/activities/route.ts` | 104 | GET endpoint with pagination + filtering (action + email). Admin-gated. Zod-validated. |
| `src/components/admin/activity-meta.tsx` | 150 | `ActionBadge` color-coded component, `entityLabel()`, `renderDetail()` JSON pretty-printer. |
| `src/components/admin/activity-filter-bar.tsx` | 160 | "use client" URL-param-driven filter form (Select + Input). |
| `src/components/admin/leads-source-trend-chart.tsx` | 296 | "use client" pure-SVG smooth-curve line chart, 3 sources, hover guide + tooltip. |
| `src/app/admin/(dashboard)/aktivitas/page.tsx` | 244 | Server component, admin-protected, paginated 50/page activity log table. |

## Files Modified (10)

| Path | Change |
|------|--------|
| `prisma/schema.prisma` | Added `AdminActivity` model (id, adminEmail, action, entityType?, entityId?, detail?, ipAddress?, createdAt) with `@@index([adminEmail])` + `@@index([createdAt])`. |
| `src/app/api/admin/login/route.ts` | Fire-and-forget LOGIN audit log with IP from request headers. |
| `src/app/api/admin/logout/route.ts` | Fire-and-forget LOGOUT audit log when session existed. |
| `src/app/api/admin/leads/[id]/route.ts` | LEAD_STATUS_UPDATE on PATCH, LEAD_DELETE on DELETE (with name/phone/status/source snapshot). |
| `src/app/api/admin/leads/bulk/route.ts` | LEAD_BULK_DELETE / LEAD_BULK_UPDATE with `{ids, count/affected, skipped}`. |
| `src/app/api/admin/blog/route.ts` | BLOG_CREATE with `{title, slug, status}`. |
| `src/app/api/admin/blog/[id]/route.ts` | BLOG_UPDATE on PATCH, BLOG_DELETE on DELETE (with title/slug/status snapshot). |
| `src/app/api/admin/services/route.ts` | SERVICE_CREATE with `{name, slug, isActive}`. |
| `src/app/api/admin/services/[id]/route.ts` | SERVICE_UPDATE on PATCH, SERVICE_DELETE on DELETE (with name/slug snapshot). |
| `src/components/admin/admin-shell.tsx` | Added `History` icon import + "Aktivitas" nav item (`/admin/aktivitas`). |
| `src/app/admin/(dashboard)/page.tsx` | Added 12th `Promise.all` entry for 14-day source-trend fetch; built `leadsSourceTrend` map; rendered `<LeadsSourceTrendChart>` as a full-width row below the conversion funnel. |

## Key Decisions

1. **Best-effort logging**: `logAdminActivity()` never throws — all DB writes are wrapped in try/catch. Callers use `void logAdminActivity(...)` so audit-log failures NEVER fail the parent operation.

2. **Snapshot before delete**: deleting leads/blog posts/services first fetches the human-readable fields (name/slug/status) so the audit log can identify what was deleted after the row is gone.

3. **Action-specific detail pretty-printing**: the `detail` column is JSON, but `renderDetail()` knows the per-action shape and renders compact Indonesian phrases (e.g. "dari NEW ke CONTACTED").

4. **Color-coded badges by entity family**: navy=auth, gold=lead updates, emerald=blog creates, slate=service creates, red=all deletes.

5. **Trend chart excludes ADMIN-source leads**: the chart is for *inbound* channels (Website/WhatsApp/Newsletter). Admin-created leads would distort the trend.

6. **Smooth bezier via Catmull-Rom**: `smoothPath()` converts points to a single `M … C … C … …` SVG path with tension 0.5 — natural smooth curves through every data point.

7. **HTML tooltip overlay vs SVG text**: the hover tooltip is an absolutely-positioned `<div>` over the SVG for crisper text + easier Tailwind styling. Position computed as % of VIEW_W so it scales responsively.

8. **Nice-tick Y-axis**: Y-axis max is rounded up to the nearest "nice" number (1, 2, 5, 10, 20, 50, …) so ticks look intentional.

9. **Filter bar resets page to 1**: changing filters deletes the `page` param so we don't land on a non-existent page after narrowing results.

10. **Server component + client filter bar**: the table is server-rendered (no client JS for the data); the filter bar is a small client component that just updates URL params — data fetching happens server-side after the URL change.

## Verification

- `bun run lint` → **0 errors, 0 warnings** (exit 0).
- `bun run db:push` → schema synced, AdminActivity table created.
- POST `/api/admin/login` → 200, LOGIN row created with `ipAddress="::1"`.
- POST `/api/admin/logout` → 200, LOGOUT row created.
- PATCH `/api/admin/leads/[id]` (status change) → 200, LEAD_STATUS_UPDATE row with detail `{"fromStatus":"NEW","toStatus":"CONTACTED","statusChanged":true,"noteUpdated":true}`.
- POST `/api/admin/leads/bulk` (update_status) → 200, LEAD_BULK_UPDATE row with detail `{"ids":[...],"toStatus":"QUALIFIED","affected":1,"skipped":0}`.
- GET `/api/admin/activities` → 200, paginated + filterable by action + email.
- GET `/admin/aktivitas` → 200, table renders friendly-label badges (Login, Logout, Update Status Lead, Update Massal Lead), entity labels, detail pretty-prints.
- GET `/admin/aktivitas?action=LOGIN` → 200, table shows only Login rows.
- GET `/admin` → 200, dashboard renders "Tren Sumber Leads" with 3 smooth bezier SVG paths + 42 per-point circles + Y-axis ticks + legend.
- Admin sidebar shows "Aktivitas" with History icon on both desktop + mobile drawer.

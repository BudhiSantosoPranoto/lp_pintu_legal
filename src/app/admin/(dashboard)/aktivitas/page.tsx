import Link from "next/link";
import { History, Inbox } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ActivityFilterBar,
} from "@/components/admin/activity-filter-bar";
import {
  ActionBadge,
  entityLabel,
  renderDetail,
} from "@/components/admin/activity-meta";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = { page?: string; action?: string; email?: string };

/**
 * Admin Activity Log page.
 *
 * Server component: reads the `?page`, `?action`, and `?email` search params,
 * fetches the matching `AdminActivity` rows (paginated 50/page), and renders
 * a color-coded table. Filter UI is delegated to `<ActivityFilterBar>` which
 * pushes new URL params and lets this component re-render server-side.
 */
export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // requireAdmin throws a redirect to /admin/login if unauthenticated.
  await requireAdmin();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const actionFilter = (sp.action ?? "").trim() || "";
  const emailFilter = (sp.email ?? "").trim().toLowerCase();

  // Build the Prisma `where` clause from the active filters.
  const where: {
    action?: string;
    adminEmail?: { contains: string };
  } = {};
  if (actionFilter) where.action = actionFilter;
  if (emailFilter) where.adminEmail = { contains: emailFilter };

  const [total, rows] = await Promise.all([
    db.adminActivity.count({ where }),
    db.adminActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  // Build pagination URLs that preserve the active filters.
  function pageHref(n: number): string {
    const next = new URLSearchParams();
    if (actionFilter) next.set("action", actionFilter);
    if (emailFilter) next.set("email", emailFilter);
    if (n > 1) next.set("page", String(n));
    const qs = next.toString();
    return qs ? `/admin/aktivitas?${qs}` : "/admin/aktivitas";
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
            <History className="size-5 text-gold-600" />
            Aktivitas Admin
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Jejak audit tindakan admin: login, perubahan lead, artikel, dan
            layanan.
          </p>
        </div>
        <div className="text-xs text-ink-soft bg-surface-alt rounded-lg px-3 py-1.5 border border-border">
          {total.toLocaleString("id-ID")} total aktivitas
        </div>
      </div>

      {/* Filter bar */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-ink">
            Filter Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFilterBar
            initialAction={actionFilter}
            initialEmail={emailFilter}
          />
        </CardContent>
      </Card>

      {/* Activity table */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-ink">
            Riwayat Aktivitas
            <span className="ml-2 text-xs font-normal text-ink-soft">
              Halaman {page} dari {totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-surface-alt text-ink-soft">
                <Inbox className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  Belum ada aktivitas tercatat
                </p>
                <p className="text-xs text-ink-soft mt-1">
                  {actionFilter || emailFilter
                    ? "Coba ubah atau hapus filter untuk melihat lebih banyak hasil."
                    : "Aktivitas admin akan muncul di sini setelah ada aksi tercatat."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 w-[160px]">Waktu</TableHead>
                    <TableHead className="w-[180px]">Admin</TableHead>
                    <TableHead className="w-[170px]">Aksi</TableHead>
                    <TableHead className="w-[120px]">Entitas</TableHead>
                    <TableHead className="pr-6">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const detailText = renderDetail(row.detail, row.action);
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="pl-6 align-top">
                          <div className="text-xs font-medium text-ink tabular-nums">
                            {format(row.createdAt, "dd MMM yyyy", {
                              locale: idLocale,
                            })}
                          </div>
                          <div className="text-[11px] text-ink-soft tabular-nums">
                            {format(row.createdAt, "HH:mm:ss", {
                              locale: idLocale,
                            })}
                          </div>
                          <div className="text-[10px] text-ink-soft mt-0.5">
                            {formatDistanceToNow(row.createdAt, {
                              addSuffix: true,
                              locale: idLocale,
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-xs font-medium text-ink truncate max-w-[180px]">
                            {row.adminEmail}
                          </div>
                          {row.ipAddress && (
                            <div className="text-[10px] text-ink-soft tabular-nums mt-0.5">
                              IP: {row.ipAddress}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <ActionBadge action={row.action} />
                        </TableCell>
                        <TableCell className="align-top">
                          {row.entityType ? (
                            <div>
                              <div className="text-xs text-ink">
                                {entityLabel(row.entityType)}
                              </div>
                              {row.entityId && (
                                <div className="text-[10px] text-ink-soft truncate max-w-[120px] font-mono">
                                  {row.entityId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-ink-soft">—</span>
                          )}
                        </TableCell>
                        <TableCell className="pr-6 align-top">
                          {detailText ? (
                            <span className="text-xs text-ink-soft break-words">
                              {detailText}
                            </span>
                          ) : (
                            <span className="text-xs text-ink-soft">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-ink-soft">
            Menampilkan{" "}
            <span className="font-medium text-ink tabular-nums">
              {(page - 1) * PAGE_SIZE + 1}
            </span>
            –
            <span className="font-medium text-ink tabular-nums">
              {Math.min(page * PAGE_SIZE, total)}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-ink tabular-nums">{total}</span>{" "}
            aktivitas
          </p>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              aria-disabled={!hasPrev}
              className={hasPrev ? "" : "pointer-events-none opacity-50"}
            >
              <Link href={pageHref(page - 1)} aria-label="Halaman sebelumnya">
                Sebelumnya
              </Link>
            </Button>
            <span className="text-xs text-ink-soft tabular-nums px-2">
              {page} / {totalPages}
            </span>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={!hasNext}
              aria-disabled={!hasNext}
              className={hasNext ? "" : "pointer-events-none opacity-50"}
            >
              <Link href={pageHref(page + 1)} aria-label="Halaman berikutnya">
                Berikutnya
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

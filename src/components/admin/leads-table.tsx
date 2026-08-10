"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Loader2,
  Trash2,
  Save,
  Search,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Building2,
  Clock,
  Download,
  Inbox,
  CalendarRange,
  Filter as FilterIcon,
  RotateCcw,
  MessageCircle,
  FileSpreadsheet,
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LEAD_STATUS,
  LEAD_STATUS_ORDER,
  leadStatusBadgeClass,
  type LeadStatusKey,
  type LeadStatusHistoryEntry,
} from "@/components/admin/lead-status";
import { LeadStatusTimeline } from "@/components/admin/lead-status-timeline";
import { LeadsBulkBar } from "@/components/admin/leads-bulk-bar";
import { WhatsAppTemplateButton } from "@/components/admin/whatsapp-template-button";
import {
  calculateLeadScore,
  LEAD_SCORE_TIER_BADGE,
  LEAD_SCORE_TIER_LABEL,
  type LeadScoreTier,
} from "@/lib/lead-scoring";
import { downloadLeadsExcel, defaultExcelFilename } from "@/lib/lead-export";

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  message: string;
  status: string;
  source: string;
  note: string;
  serviceId: string;
  serviceName: string | null;
  serviceSlug: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistories: LeadStatusHistoryEntry[];
};

type ServiceOption = { id: string; name: string };

const STATUS_FILTERS: { key: "ALL" | LeadStatusKey; label: string }[] = [
  { key: "ALL", label: "Semua" },
  ...LEAD_STATUS_ORDER.map((k) => ({ key: k, label: LEAD_STATUS[k].label })),
];

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: idLocale });
  } catch {
    return iso;
  }
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return formatDate(iso);
}

/** Lead is considered "stale" if it has been NEW or CONTACTED for >48h
 *  since its last update. Used by the dashboard warning card + the
 *  `?stale=1` deep-link filter on the leads page. */
const STALE_MS = 48 * 60 * 60 * 1000;
const STALE_STATUSES = new Set(["NEW", "CONTACTED"]);

export function isStaleLead(lead: { status: string; updatedAt: string }): boolean {
  if (!STALE_STATUSES.has(lead.status)) return false;
  return Date.now() - new Date(lead.updatedAt).getTime() > STALE_MS;
}

/**
 * Trigger a CSV download of the given leads.
 *
 * If a date range is applied (from/to), the filename follows the pattern
 * `leads-{from}-to-{to}.csv` so the exported file is self-describing.
 * Missing ends use `mulai` (start) / `kini` (now) so the filename stays
 * readable. Without a date range the legacy `pintu-legal-leads-{today}.csv`
 * name is used.
 */
function exportCsv(rows: LeadRow[], from?: string, to?: string) {
  const headers = [
    "Nama",
    "Telepon",
    "Email",
    "Bisnis",
    "Layanan",
    "Status",
    "Sumber",
    "Catatan",
    "Pesan",
    "Dibuat",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const cells = [
      r.name,
      r.phone,
      r.email,
      r.businessName,
      r.serviceName ?? "",
      r.status,
      r.source,
      r.note,
      r.message,
      r.createdAt,
    ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
    lines.push(cells.join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  let filename: string;
  if (from || to) {
    const fromPart = from || "mulai";
    const toPart = to || "kini";
    filename = `leads-${fromPart}-to-${toPart}.csv`;
  } else {
    filename = `pintu-legal-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
  }
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function LeadsTable({
  leads,
  services,
  scores,
  initialHighOnly = false,
}: {
  leads: LeadRow[];
  services: ServiceOption[];
  /** Pre-computed scores keyed by lead id (server-supplied). When absent
   *  the table computes them client-side via `calculateLeadScore` — both
   *  paths produce identical results since the function is pure. */
  scores?: Record<string, { score: number; tier: LeadScoreTier; factors: string[] }>;
  /** Initial state for the "Skor Tertinggi" filter chip. The dashboard's
   *  "Distribusi Skor Lead" card and the leads page both deep-link via
   *  `?score=high`; the server passes `initialHighOnly=true` so the table
   *  opens already filtered to the high tier. */
  initialHighOnly?: boolean;
}) {
  const [filter, setFilter] = React.useState<"ALL" | LeadStatusKey>("ALL");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  // "Perlu Perhatian" toggle — when active, only stale leads (NEW/CONTACTED,
  // not updated >48h) are shown. Initialised from `?stale=1` URL param so the
  // dashboard warning card can deep-link here.
  const [staleOnly, setStaleOnly] = React.useState(false);
  // "Skor Tertinggi" toggle — when active, only high-tier (score 70–100)
  // leads are shown. Mutually exclusive with `staleOnly` and the per-status
  // chips so the operator always has a single, predictable filter active.
  const [highOnly, setHighOnly] = React.useState<boolean>(initialHighOnly);
  // Sort state for the Skor column: "none" (default order = createdAt desc),
  // "desc" (highest first), or "asc" (lowest first).
  const [scoreSort, setScoreSort] = React.useState<"none" | "asc" | "desc">(
    "none"
  );
  // Excel export feedback state — toggles the spinner on the export button
  // and disables both export buttons while a workbook is being generated.
  const [exporting, setExporting] = React.useState(false);

  // Bulk-selection state. Tracks the IDs the operator has checked across the
  // whole table (not just the currently-filtered view). We use a Set for O(1)
  // membership checks and replace it with a fresh instance on every mutation
  // so React + the immutability lint rule both stay happy.
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set()
  );

  // Date range filter state. `dateFrom`/`dateTo` track the input boxes
  // (uncommitted); `appliedFrom`/`appliedTo` are the values actually used
  // by the filter. The "Filter" button commits the inputs; "Reset" clears
  // both layers.
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [appliedFrom, setAppliedFrom] = React.useState("");
  const [appliedTo, setAppliedTo] = React.useState("");

  const hasAppliedDateFilter = Boolean(appliedFrom || appliedTo);
  const hasDirtyDateInputs =
    dateFrom !== appliedFrom || dateTo !== appliedTo;
  const canResetDateFilter =
    Boolean(
      dateFrom ||
        dateTo ||
        appliedFrom ||
        appliedTo ||
        staleOnly ||
        highOnly ||
        scoreSort !== "none"
    );

  // Read `?stale=1` and `?score=high` from the URL on mount (deep-links from
  // the dashboard "Perlu Perhatian" / "Distribusi Skor Lead" cards). Also
  // clears the param so it doesn't linger in the address bar after the user
  // navigates away. The page can also pre-seed `initialHighOnly`, but reading
  // the URL here lets us clear it consistently with `?stale=1`.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    if (params.get("stale") === "1") {
      setStaleOnly(true);
      params.delete("stale");
      changed = true;
    }
    if (params.get("score") === "high") {
      setHighOnly(true);
      params.delete("score");
      changed = true;
    }
    if (changed) {
      const next = params.toString();
      const nextUrl =
        window.location.pathname + (next ? `?${next}` : "") + window.location.hash;
      window.history.replaceState(null, "", nextUrl);
    }
  }, []);

  const staleCount = React.useMemo(
    () => leads.filter(isStaleLead).length,
    [leads]
  );

  // ─── Lead scoring ──────────────────────────────────────────────────────────
  // Build a Map<leadId, LeadScoreResult> once per `leads` change. When the
  // server passes pre-computed `scores` (the common case on the leads page),
  // we use them as-is — otherwise we compute them client-side via
  // `calculateLeadScore`. Both paths are deterministic so the badges always
  // match the dashboard's distribution card.
  const scoreMap = React.useMemo(() => {
    const map = new Map<
      string,
      { score: number; tier: LeadScoreTier; factors: string[] }
    >();
    if (scores) {
      for (const [id, val] of Object.entries(scores)) {
        map.set(id, val);
      }
    } else {
      for (const l of leads) {
        map.set(l.id, calculateLeadScore(l));
      }
    }
    return map;
  }, [leads, scores]);

  const highScoreCount = React.useMemo(
    () =>
      leads.reduce(
        (n, l) => n + (scoreMap.get(l.id)?.tier === "high" ? 1 : 0),
        0
      ),
    [leads, scoreMap]
  );

  const filtered = React.useMemo(() => {
    let list = leads;
    if (staleOnly) {
      list = list.filter(isStaleLead);
    } else if (highOnly) {
      // Only leads in the high tier (score ≥ 70) — the operator's "best
      // opportunities" view. Mutually exclusive with the per-status chips.
      list = list.filter((l) => scoreMap.get(l.id)?.tier === "high");
    } else if (filter !== "ALL") {
      list = list.filter((l) => l.status === filter);
    }

    if (appliedFrom || appliedTo) {
      const fromMs = appliedFrom
        ? new Date(appliedFrom + "T00:00:00").getTime()
        : -Infinity;
      const toMs = appliedTo
        ? new Date(appliedTo + "T23:59:59.999").getTime()
        : Infinity;
      list = list.filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t >= fromMs && t <= toMs;
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.businessName ?? "").toLowerCase().includes(q) ||
          (l.serviceName ?? "").toLowerCase().includes(q)
      );
    }

    // Sort by score when requested. We slice() first so we don't mutate the
    // (already-filtered) `list` reference in place — React's useMemo output
    // must be a new array when contents change.
    if (scoreSort !== "none") {
      list = list.slice().sort((a, b) => {
        const sa = scoreMap.get(a.id)?.score ?? 0;
        const sb = scoreMap.get(b.id)?.score ?? 0;
        return scoreSort === "desc" ? sb - sa : sa - sb;
      });
    }

    return list;
  }, [leads, filter, search, appliedFrom, appliedTo, staleOnly, highOnly, scoreSort, scoreMap]);

  // Excel export — generates the workbook client-side and triggers a
  // download. Wrapped in try/catch so a failure (e.g. xlsx parse error on
  // very long messages) surfaces as a toast instead of an unhandled promise.
  const handleExportExcel = React.useCallback(async () => {
    if (filtered.length === 0) return;
    setExporting(true);
    try {
      // Yield to the browser so the spinner can paint before the (potentially
      // long) synchronous `buildLeadsExcel` call runs.
      await new Promise((r) => setTimeout(r, 0));
      downloadLeadsExcel(
        filtered.map((l) => ({
          name: l.name,
          phone: l.phone,
          email: l.email,
          businessName: l.businessName,
          serviceName: l.serviceName,
          message: l.message,
          status: l.status,
          source: l.source,
          serviceId: l.serviceId,
          createdAt: l.createdAt,
        })),
        defaultExcelFilename(appliedFrom, appliedTo)
      );
      toast.success(`Ekspor Excel: ${filtered.length} lead diunduh.`);
    } catch (err) {
      console.error("[leads] excel export failed", err);
      toast.error("Gagal membuat file Excel. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  }, [filtered, appliedFrom, appliedTo]);

  const handleApplyDateFilter = React.useCallback(() => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
  }, [dateFrom, dateTo]);

  const handleResetDateFilter = React.useCallback(() => {
    setDateFrom("");
    setDateTo("");
    setAppliedFrom("");
    setAppliedTo("");
    setStaleOnly(false);
    setHighOnly(false);
    setScoreSort("none");
    setFilter("ALL");
  }, []);

  // ─── Bulk selection helpers ───────────────────────────────────────────────
  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // "Select all" only operates on the currently-filtered rows so the operator
  // can check "everything I'm looking at right now" without affecting leads
  // hidden behind a filter.
  const allVisibleSelected =
    filtered.length > 0 && filtered.every((l) => selectedIds.has(l.id));
  const someVisibleSelected =
    !allVisibleSelected && filtered.some((l) => selectedIds.has(l.id));

  const toggleSelectAllVisible = React.useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (filtered.every((l) => next.has(l.id))) {
        for (const l of filtered) next.delete(l.id);
      } else {
        for (const l of filtered) next.add(l.id);
      }
      return next;
    });
  }, [filtered]);

  const handleRefresh = React.useCallback(() => {
    setSelectedIds(new Set());
    window.location.reload();
  }, []);

  const selected = React.useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId]
  );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const active = !staleOnly && !highOnly && filter === f.key;
              const count =
                f.key === "ALL"
                  ? leads.length
                  : leads.filter((l) => l.status === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setStaleOnly(false);
                    setHighOnly(false);
                    setFilter(f.key);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                    active
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-ink-soft border-border hover:border-navy/30 hover:text-navy"
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "tabular-nums text-[10px] rounded-full px-1.5 py-0.5",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-surface-alt text-ink-soft"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            {staleCount > 0 && (
              <button
                onClick={() => {
                  setStaleOnly((v) => !v);
                  setHighOnly(false);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                  staleOnly
                    ? "bg-gold-600 text-white border-gold-600"
                    : "bg-gold-50 text-gold-700 border-gold-200 hover:border-gold-400 hover:text-gold-700"
                )}
                title="Lead dengan status Baru/Dihubungi yang belum diperbarui >48 jam"
              >
                <Clock className="size-3.5" />
                Perlu Perhatian
                <span
                  className={cn(
                    "tabular-nums text-[10px] rounded-full px-1.5 py-0.5",
                    staleOnly
                      ? "bg-white/20 text-white"
                      : "bg-gold-200 text-gold-700"
                  )}
                >
                  {staleCount}
                </span>
              </button>
            )}
            {highScoreCount > 0 && (
              <button
                onClick={() => {
                  setHighOnly((v) => !v);
                  setStaleOnly(false);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                  highOnly
                    ? "bg-gold text-white border-gold"
                    : "bg-gold-50 text-gold-700 border-gold-200 hover:border-gold-400 hover:text-gold-700"
                )}
                title="Lead dengan skor 70–100 (tier Tinggi) — potensi tertinggi"
              >
                <Star className="size-3.5" />
                Skor Tertinggi
                <span
                  className={cn(
                    "tabular-nums text-[10px] rounded-full px-1.5 py-0.5",
                    highOnly
                      ? "bg-white/20 text-white"
                      : "bg-gold-200 text-gold-700"
                  )}
                >
                  {highScoreCount}
                </span>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft" />
              <Input
                placeholder="Cari nama, telepon, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => exportCsv(filtered, appliedFrom, appliedTo)}
              disabled={filtered.length === 0}
              title="Ekspor ke CSV"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-navy-200 bg-navy-50 text-navy hover:bg-navy-100 hover:text-navy"
              onClick={() => handleExportExcel()}
              disabled={filtered.length === 0 || exporting}
              title="Ekspor ke Excel (.xlsx)"
            >
              {exporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="size-4" />
              )}
              <span className="hidden sm:inline">Excel</span>
            </Button>
          </div>
        </div>

        {/* Date range filter row */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-alt/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <CalendarRange className="size-3.5 text-gold-600" />
              Rentang tanggal
            </span>
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Dari tanggal"
                className="h-9 w-[150px] text-sm"
              />
              <span className="text-ink-soft" aria-hidden>
                —
              </span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Sampai tanggal"
                className="h-9 w-[150px] text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-navy-200 bg-white text-navy hover:bg-navy-50 hover:text-navy"
              onClick={handleApplyDateFilter}
              disabled={!hasDirtyDateInputs}
            >
              <FilterIcon className="size-3.5" />
              Filter
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-ink-soft hover:text-navy"
              onClick={handleResetDateFilter}
              disabled={!canResetDateFilter}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-ink-soft" aria-live="polite">
            {hasAppliedDateFilter ||
            filter !== "ALL" ||
            search ||
            staleOnly ||
            highOnly ||
            scoreSort !== "none" ? (
              <>
                Menampilkan{" "}
                <span className="font-semibold text-navy">
                  {filtered.length}
                </span>{" "}
                dari {leads.length} lead
                {staleOnly && (
                  <>
                    {" "}
                    · <span className="text-gold-700">filter: perlu perhatian</span>
                  </>
                )}
                {highOnly && (
                  <>
                    {" "}
                    · <span className="text-gold-700">filter: skor tertinggi</span>
                  </>
                )}
                {scoreSort !== "none" && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-navy">
                      urut: skor{" "}
                      {scoreSort === "desc" ? "↓" : "↑"}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                Total{" "}
                <span className="font-semibold text-navy">
                  {leads.length}
                </span>{" "}
                lead
              </>
            )}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-surface-alt/50">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  aria-label={
                    allVisibleSelected
                      ? "Batal pilih semua lead di halaman ini"
                      : "Pilih semua lead di halaman ini"
                  }
                  checked={
                    allVisibleSelected
                      ? true
                      : someVisibleSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={toggleSelectAllVisible}
                  className="data-[state=checked]:bg-navy data-[state=checked]:border-navy data-[state=indeterminate]:bg-navy data-[state=indeterminate]:border-navy"
                  disabled={filtered.length === 0}
                />
              </TableHead>
              <TableHead className="pl-0">Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScoreSort((prev) =>
                      prev === "none"
                        ? "desc"
                        : prev === "desc"
                          ? "asc"
                          : "none"
                    );
                  }}
                  className="group inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-ink-soft hover:text-navy transition-colors"
                  aria-label={`Urutkan berdasarkan skor (saat ini: ${
                    scoreSort === "none"
                      ? "tidak"
                      : scoreSort === "desc"
                        ? "tinggi ke rendah"
                        : "rendah ke tinggi"
                  })`}
                  title="Urutkan berdasarkan skor lead"
                >
                  Skor
                  {scoreSort === "none" ? (
                    <ArrowDownUp className="size-3 opacity-50 group-hover:opacity-100" />
                  ) : scoreSort === "desc" ? (
                    <ArrowDown className="size-3 text-gold-600" />
                  ) : (
                    <ArrowUp className="size-3 text-gold-600" />
                  )}
                </button>
              </TableHead>
              <TableHead>Diterima</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-ink-soft">
                    <Inbox className="size-6 opacity-40" />
                    <p className="text-sm">Tidak ada lead yang cocok.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => {
                const isSelected = selectedIds.has(lead.id);
                const scoreInfo = scoreMap.get(lead.id);
                return (
                  <TableRow
                    key={lead.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected && "bg-gold-50 ring-1 ring-inset ring-gold-200"
                    )}
                    onClick={() => setSelectedId(lead.id)}
                    data-selected={isSelected ? "true" : undefined}
                  >
                    <TableCell
                      className="pl-4 pr-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        aria-label={`Pilih lead ${lead.name}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(lead.id)}
                        className="data-[state=checked]:bg-navy data-[state=checked]:border-navy"
                      />
                    </TableCell>
                    <TableCell className="pl-0">
                      <div className="font-medium text-ink">{lead.name}</div>
                      {lead.businessName && (
                        <div className="text-xs text-ink-soft">
                          {lead.businessName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-ink-soft tabular-nums">
                      {lead.phone}
                    </TableCell>
                    <TableCell className="text-sm text-ink-soft">
                      {lead.serviceName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={leadStatusBadgeClass(lead.status)}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full mr-1",
                            LEAD_STATUS[(lead.status as LeadStatusKey) ?? "NEW"]?.dot ??
                              "bg-ink-soft"
                          )}
                        />
                        {LEAD_STATUS[(lead.status as LeadStatusKey) ?? "NEW"]?.label ??
                          lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scoreInfo ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 outline-none"
                              aria-label={`Skor ${scoreInfo.score} dari 100 (${LEAD_SCORE_TIER_LABEL[scoreInfo.tier]})`}
                            >
                              <Badge
                                variant="outline"
                                className={cn(
                                  "tabular-nums cursor-help",
                                  LEAD_SCORE_TIER_BADGE[scoreInfo.tier]
                                )}
                              >
                                {scoreInfo.score}
                              </Badge>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="bg-navy text-white border border-navy-600 max-w-[280px] p-3"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="font-semibold text-gold">
                                  Skor {scoreInfo.score}/100
                                </span>
                                <span className="text-white/70">
                                  {LEAD_SCORE_TIER_LABEL[scoreInfo.tier]}
                                </span>
                              </div>
                              {scoreInfo.factors.length > 0 ? (
                                <ul className="space-y-0.5 text-[11px] text-white/90">
                                  {scoreInfo.factors.map((f) => (
                                    <li key={f} className="flex items-start gap-1.5">
                                      <span className="text-gold mt-0.5">•</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[11px] text-white/60 italic">
                                  Belum ada sinyal keterlibatan.
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-ink-soft">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-ink-soft whitespace-nowrap">
                      {relativeDate(lead.createdAt)}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(lead.id);
                        }}
                      >
                        <Eye className="size-4" />
                        <span className="hidden sm:inline">Detail</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Sheet */}
      <LeadDetailSheet
        lead={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelectedId(null)}
        services={services}
      />

      {/* Floating bulk-action bar */}
      {selectedIds.size > 0 && (
        <LeadsBulkBar
          selectedIds={selectedIds}
          onClear={clearSelection}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}

function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  services,
}: {
  lead: LeadRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceOption[];
}) {
  const [status, setStatus] = React.useState<string>(lead?.status ?? "NEW");
  const [note, setNote] = React.useState<string>(lead?.note ?? "");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Sync local state when lead changes
  React.useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNote(lead.note);
    }
  }, [lead?.id]);

  if (!lead) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md" />
      </Sheet>
    );
  }

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      toast.success("Lead diperbarui.");
      // Refresh to reflect updates on the table
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!lead) return;
    if (!confirm("Hapus lead ini secara permanen? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menghapus lead.");
        return;
      }
      toast.success("Lead dihapus.");
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan saat menghapus.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="text-lg text-ink">{lead.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Detail lead dan pembaruan status.
          </SheetDescription>
          <div className="text-xs text-ink-soft flex items-center gap-1.5">
            <Clock className="size-3" />
            {formatDate(lead.createdAt)}
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Contact info */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Kontak
            </h3>
            <div className="grid gap-1.5 text-sm">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 text-ink hover:text-navy"
              >
                <Phone className="size-4 text-ink-soft" />
                {lead.phone}
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2 text-ink hover:text-navy truncate"
                >
                  <Mail className="size-4 text-ink-soft shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </a>
              )}
              {lead.businessName && (
                <div className="flex items-center gap-2 text-ink">
                  <Building2 className="size-4 text-ink-soft" />
                  {lead.businessName}
                </div>
              )}
            </div>
            {/* WhatsApp click-to-chat with template selector */}
            <WhatsAppTemplateButton
              lead={{
                name: lead.name,
                phone: lead.phone,
                serviceName: lead.serviceName,
                businessName: lead.businessName,
                message: lead.message,
              }}
            />
          </div>

          {/* Service */}
          {lead.serviceName && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                Layanan Diminati
              </h3>
              <Badge
                variant="outline"
                className="bg-navy-50 text-navy border-navy/15"
              >
                {lead.serviceName}
              </Badge>
            </div>
          )}

          {/* Lead score — computed live from the lead's current fields so it
              updates instantly when the admin changes the status (after save).
              The badge color reflects the tier; the factors list explains the
              "why" behind the number. */}
          <LeadScoreCard lead={lead} />

          {/* Message */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="size-3.5" />
              Pesan
            </h3>
            <div className="rounded-lg bg-surface-alt p-3 text-sm text-ink whitespace-pre-wrap leading-relaxed">
              {lead.message}
            </div>
          </div>

          {/* Status update */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUS_ORDER.map((k) => (
                  <SelectItem key={k} value={k}>
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          LEAD_STATUS[k].dot
                        )}
                      />
                      {LEAD_STATUS[k].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Internal note */}
          <div className="space-y-1.5">
            <Label
              htmlFor="note"
              className="text-xs font-semibold text-ink-soft uppercase tracking-wider"
            >
              Catatan Internal
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan: kapan dihubungi, follow-up, dll."
              className="min-h-24 resize-y"
            />
          </div>

          {/* Status history timeline */}
          <LeadStatusTimeline histories={lead.statusHistories ?? []} />
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Hapus
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || deleting}
            className="ml-auto bg-navy hover:bg-navy-700 text-white"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Simpan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Compact score card shown inside the lead detail Sheet. Recomputes the score
 * from the lead's current fields on every render so the admin sees the impact
 * of a status change immediately after saving (the page reloads, but if we
 * ever remove the reload the score will still be live).
 */
function LeadScoreCard({ lead }: { lead: LeadRow }) {
  // Use the editable `status` from the Sheet's local state? No — we want the
  // score to reflect the *persisted* lead, so we use `lead.status` directly.
  const scoreInfo = calculateLeadScore(lead);
  return (
    <div className="rounded-lg border border-border bg-surface-alt/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider flex items-center gap-1.5">
          <Star className="size-3.5 text-gold-600" />
          Skor Lead
        </h3>
        <Badge
          variant="outline"
          className={cn("tabular-nums", LEAD_SCORE_TIER_BADGE[scoreInfo.tier])}
        >
          {scoreInfo.score}/100 · {LEAD_SCORE_TIER_LABEL[scoreInfo.tier]}
        </Badge>
      </div>
      {scoreInfo.factors.length > 0 ? (
        <ul className="space-y-0.5 text-xs text-ink">
          {scoreInfo.factors.map((f) => (
            <li key={f} className="flex items-start gap-1.5">
              <span className="text-gold-600 mt-0.5">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-ink-soft italic">
          Belum ada sinyal keterlibatan. Lengkapi email, nama usaha, atau
          pilih layanan untuk menaikkan skor.
        </p>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEAD_STATUS,
  LEAD_STATUS_ORDER,
  type LeadStatusKey,
} from "@/components/admin/lead-status";

/**
 * Floating bulk-action bar shown at the bottom of the admin leads page when
 * one or more leads are checked. Hosts the bulk status-change select, the
 * bulk-delete confirmation dialog, and a "clear selection" button.
 *
 * All API calls go through the single `/api/admin/leads/bulk` endpoint —
 * the parent component just decides what to do after the call resolves
 * (typically `window.location.reload()` to refresh the table).
 */
export function LeadsBulkBar({
  selectedIds,
  onClear,
  onRefresh,
}: {
  selectedIds: Set<string>;
  onClear: () => void;
  onRefresh: () => void;
}) {
  const selectedCount = selectedIds.size;
  const [pendingStatus, setPendingStatus] =
    React.useState<LeadStatusKey | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<"update" | "delete" | null>(
    null
  );

  // The Select is a "menu": its value resets to "" after each pick so the
  // same status can be picked again later. We keep `pendingStatus` only to
  // surface a "Memperbarui…" placeholder while the request is in-flight.
  async function runBulkUpdate(status: LeadStatusKey) {
    setLoading("update");
    setPendingStatus(status);
    try {
      const res = await fetch("/api/admin/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: "update_status",
          status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal memperbarui status lead.");
        return;
      }
      const affected = data.affected ?? 0;
      const skipped = data.skipped ?? 0;
      toast.success(
        `${affected} lead diperbarui ke "${LEAD_STATUS[status].label}"` +
          (skipped > 0 ? ` (${skipped} tanpa perubahan).` : ".")
      );
      onRefresh();
    } catch {
      toast.error("Kesalahan jaringan saat memperbarui lead.");
    } finally {
      setLoading(null);
      setPendingStatus(null);
    }
  }

  async function runBulkDelete() {
    setLoading("delete");
    try {
      const res = await fetch("/api/admin/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: "delete",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menghapus lead.");
        return;
      }
      toast.success(`${data.affected ?? 0} lead dihapus.`);
      setDeleteOpen(false);
      onRefresh();
    } catch {
      toast.error("Kesalahan jaringan saat menghapus lead.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <div
        role="region"
        aria-label="Aksi massal lead"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl"
      >
        <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-navy text-white shadow-soft-lg px-3 sm:px-4 py-2.5">
          <div className="inline-flex items-center justify-center size-8 rounded-lg bg-white/10 shrink-0">
            <ListChecks className="size-4 text-gold" />
          </div>
          <p className="text-sm font-medium whitespace-nowrap">
            <span className="tabular-nums font-semibold">{selectedCount}</span>{" "}
            lead dipilih
          </p>

          {/* Bulk status update */}
          <div className="ml-1 sm:ml-2 flex-1 min-w-0">
            <Select
              value=""
              onValueChange={(v) => {
                if (v) void runBulkUpdate(v as LeadStatusKey);
              }}
              disabled={loading !== null}
            >
              <SelectTrigger
                className="h-9 w-full sm:w-44 bg-white/10 border-white/15 text-white hover:bg-white/15 focus:ring-white/30"
                aria-label="Ubah status lead terpilih"
              >
                <SelectValue
                  placeholder={
                    loading === "update" && pendingStatus
                      ? "Memperbarui…"
                      : "Ubah Status"
                  }
                />
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

          {/* Bulk delete */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-9 bg-red-500 hover:bg-red-400 text-white shrink-0"
            onClick={() => setDeleteOpen(true)}
            disabled={loading !== null}
          >
            {loading === "delete" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            <span className="hidden sm:inline">Hapus</span>
          </Button>

          {/* Clear selection */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 text-white/80 hover:text-white hover:bg-white/10 shrink-0"
            onClick={onClear}
            disabled={loading !== null}
            aria-label="Batalkan pilihan"
          >
            <X className="size-4" />
            <span className="hidden sm:inline">Batal</span>
          </Button>
        </div>
      </div>

      {/* Bulk-delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="inline-flex items-center justify-center size-10 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 mb-2">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle>Hapus {selectedCount} lead?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua lead yang dipilih akan
              dihapus permanen beserta riwayat statusnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={loading === "delete"}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void runBulkDelete()}
              disabled={loading === "delete"}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading === "delete" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menghapus…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Hapus {selectedCount} Lead
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

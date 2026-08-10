"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare,
  ArrowRight,
  CheckCircle2,
  Clock,
  Tag,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ComparableService } from "@/data/queries";

const MAX_SELECTION = 3;
const MIN_SELECTION = 2;
const HIGHLIGHT_PREVIEW = 3;
const REQUIREMENT_PREVIEW = 3;

/**
 * Service comparison tool for the /layanan page.
 *
 * Renders a "Bandingkan Layanan" trigger button. When clicked, opens a Dialog
 * containing:
 *   - a multi-select list of services (max 3, min 2 to enable the table)
 *   - a comparison table with the selected services as columns and the
 *     attributes (name, short description, duration, category, highlights,
 *     requirements) as rows
 *   - a CTA per column linking to the service detail page
 *
 * The dialog is responsive: the table scrolls horizontally on small screens.
 * All copy is in Bahasa Indonesia.
 */
export function ServiceComparison({
  services,
}: {
  services: ComparableService[];
}) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);

  const selectedServices = React.useMemo(
    () =>
      selected
        .map((id) => services.find((s) => s.id === id))
        .filter((s): s is ComparableService => Boolean(s)),
    [selected, services]
  );

  const toggleService = React.useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, id];
    });
  }, []);

  const clearSelection = React.useCallback(() => setSelected([]), []);

  // Reset selection when the dialog closes so reopening starts fresh.
  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      // Defer reset so the closing animation isn't interrupted.
      setTimeout(() => setSelected([]), 200);
    }
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 gap-2 border-navy-200 bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-gold-300 hover:bg-gold-50 hover:text-navy"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <GitCompare className="h-4 w-4 text-gold-600" />
        Bandingkan Layanan
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[92vh] flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-4xl lg:max-w-6xl"
          aria-describedby="compare-dialog-desc"
        >
          {/* Header */}
          <DialogHeader className="border-b border-border bg-navy px-5 py-4 sm:px-7">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-white sm:text-xl">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <GitCompare className="h-4 w-4 text-gold" />
              </span>
              Bandingkan Layanan
            </DialogTitle>
            <DialogDescription
              id="compare-dialog-desc"
              className="text-sm text-white/70"
            >
              Pilih {MIN_SELECTION}–{MAX_SELECTION} layanan untuk melihat
              perbandingan secara berdampingan.
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            {/* Selection summary + reset */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-soft">
                <span className="font-semibold text-navy">
                  {selected.length}
                </span>
                <span> / {MAX_SELECTION} layanan dipilih</span>
                {selected.length < MIN_SELECTION && (
                  <span className="ml-2 text-xs text-ink-soft/80">
                    · Pilih minimal {MIN_SELECTION} layanan
                  </span>
                )}
              </p>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft transition-colors hover:text-navy"
                >
                  <X className="h-3.5 w-3.5" />
                  Hapus pilihan
                </button>
              )}
            </div>

            {/* Multi-select chips */}
            <SelectionGrid
              services={services}
              selected={selected}
              onToggle={toggleService}
            />

            {/* Comparison table or empty state */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {selectedServices.length >= MIN_SELECTION ? (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ComparisonTable services={selectedServices} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EmptyState hasSelection={selected.length > 0} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Selection grid ────────────────────────────────────────────────────────

function SelectionGrid({
  services,
  selected,
  onToggle,
}: {
  services: ComparableService[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const isLocked = selected.length >= MAX_SELECTION;

  return (
    <div
      role="group"
      aria-label="Pilih layanan untuk dibandingkan"
      className="grid max-h-56 gap-2 overflow-y-auto rounded-xl border border-border bg-surface-alt p-3 sm:max-h-64 sm:grid-cols-2"
    >
      {services.map((s) => {
        const isSelected = selected.includes(s.id);
        const isDisabled = !isSelected && isLocked;
        return (
          <label
            key={s.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-all",
              isSelected
                ? "border-gold-300 bg-gold-50/60 shadow-soft"
                : "border-border hover:border-gold-200 hover:bg-white",
              isDisabled && "cursor-not-allowed opacity-50"
            )}
          >
            <Checkbox
              checked={isSelected}
              disabled={isDisabled}
              onCheckedChange={() => onToggle(s.id)}
              aria-label={`Pilih ${s.name}`}
              className="mt-0.5 data-[state=checked]:bg-navy data-[state=checked]:border-navy data-[state=checked]:text-white"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-navy">
                {s.name}
              </span>
              {s.category && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft">
                  <Tag className="h-3 w-3" />
                  {s.category.name}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ hasSelection }: { hasSelection: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white shadow-soft ring-1 ring-border">
        <GitCompare className="h-5 w-5 text-gold-600" />
      </div>
      <p className="mt-3 text-sm font-semibold text-navy">
        {hasSelection
          ? "Pilih satu layanan lagi untuk mulai membandingkan"
          : "Pilih minimal 2 layanan untuk membandingkan"}
      </p>
      <p className="mt-1 text-xs text-ink-soft">
        Anda dapat membandingkan hingga {MAX_SELECTION} layanan sekaligus.
      </p>
    </div>
  );
}

// ─── Comparison table ────────────────────────────────────────────────────────

function ComparisonTable({ services }: { services: ComparableService[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border shadow-soft">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-navy text-white">
            <th
              scope="col"
              className="w-44 shrink-0 border-r border-white/10 px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 sm:w-56"
            >
              Kriteria
            </th>
            {services.map((s) => (
              <th
                key={s.id}
                scope="col"
                className="border-r border-white/10 px-4 py-4 align-top last:border-r-0"
              >
                <span className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gold/15 ring-1 ring-gold/30">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                  </span>
                  <span className="text-sm font-bold leading-snug text-white">
                    {s.name}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:nth-child(odd)]:bg-white [&_tr:nth-child(even)]:bg-surface-alt">
          <ComparisonRow label="Deskripsi Singkat">
            {services.map((s) => (
              <ComparisonCell key={s.id}>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {s.shortDescription}
                </p>
              </ComparisonCell>
            ))}
          </ComparisonRow>

          <ComparisonRow label="Estimasi Durasi" icon={<Clock className="h-3.5 w-3.5" />}>
            {services.map((s) => (
              <ComparisonCell key={s.id}>
                {s.durationLabel ? (
                  <span className="inline-flex items-center rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-600 ring-1 ring-gold-200">
                    {s.durationLabel}
                  </span>
                ) : (
                  <span className="text-xs italic text-ink-soft/70">
                    Bervariasi
                  </span>
                )}
              </ComparisonCell>
            ))}
          </ComparisonRow>

          <ComparisonRow label="Kategori" icon={<Tag className="h-3.5 w-3.5" />}>
            {services.map((s) => (
              <ComparisonCell key={s.id}>
                {s.category ? (
                  <Link
                    href={`/layanan?cat=${s.category.slug}`}
                    className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy ring-1 ring-navy-100 transition-colors hover:bg-navy-100"
                  >
                    {s.category.name}
                  </Link>
                ) : (
                  <span className="text-xs italic text-ink-soft/70">—</span>
                )}
              </ComparisonCell>
            ))}
          </ComparisonRow>

          <ComparisonRow label="Apa yang Termasuk">
            {services.map((s) => (
              <ComparisonCell key={s.id}>
                {s.highlights.length > 0 ? (
                  <ul className="space-y-1.5">
                    {s.highlights.slice(0, HIGHLIGHT_PREVIEW).map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-xs leading-snug text-ink-soft"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
                        <span>{h}</span>
                      </li>
                    ))}
                    {s.highlights.length > HIGHLIGHT_PREVIEW && (
                      <li className="text-[11px] font-medium text-gold-600">
                        +{s.highlights.length - HIGHLIGHT_PREVIEW} lainnya
                      </li>
                    )}
                  </ul>
                ) : (
                  <span className="text-xs italic text-ink-soft/70">
                    Detail menyusul
                  </span>
                )}
              </ComparisonCell>
            ))}
          </ComparisonRow>

          <ComparisonRow label="Dokumen Diperlukan">
            {services.map((s) => (
              <ComparisonCell key={s.id}>
                {s.requirements.length > 0 ? (
                  <ul className="space-y-1.5">
                    {s.requirements
                      .slice(0, REQUIREMENT_PREVIEW)
                      .map((r, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-xs leading-snug text-ink-soft"
                        >
                          <span
                            aria-hidden
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy-400"
                          />
                          <span>{r}</span>
                        </li>
                      ))}
                    {s.requirements.length > REQUIREMENT_PREVIEW && (
                      <li className="text-[11px] font-medium text-gold-600">
                        +{s.requirements.length - REQUIREMENT_PREVIEW} lainnya
                      </li>
                    )}
                  </ul>
                ) : (
                  <span className="text-xs italic text-ink-soft/70">
                    Hubungi kami
                  </span>
                )}
              </ComparisonCell>
            ))}
          </ComparisonRow>

          {/* CTA row */}
          <ComparisonRow label="">
            {services.map((s) => (
              <ComparisonCell key={s.id}>
                <Button
                  asChild
                  size="sm"
                  className="h-9 w-full bg-navy text-white hover:bg-navy-700"
                >
                  <Link href={`/layanan/${s.slug}`}>
                    Lihat Detail
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </ComparisonCell>
            ))}
          </ComparisonRow>
        </tbody>
      </table>
    </div>
  );
}

function ComparisonRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-t border-border">
      <th
        scope="row"
        className="w-44 shrink-0 border-r border-border bg-navy-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-navy align-top sm:w-56"
      >
        <span className="flex items-center gap-1.5">
          {icon && <span className="text-gold-600">{icon}</span>}
          {label}
        </span>
      </th>
      {children}
    </tr>
  );
}

function ComparisonCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="border-r border-border px-4 py-3 align-top last:border-r-0">
      {children}
    </td>
  );
}

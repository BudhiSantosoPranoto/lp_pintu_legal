"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { History, ArrowRight, UserCog, Bot } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LEAD_STATUS,
  leadStatusBadgeClass,
  type LeadStatusKey,
  type LeadStatusHistoryEntry,
} from "@/components/admin/lead-status";

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: idLocale });
  } catch {
    return iso;
  }
}

/**
 * Vertical timeline of every status transition recorded for a lead.
 *
 * Renders nothing when the lead has no history yet (e.g. a brand-new lead
 * that has never been touched by an admin). Each entry shows the
 * from → to transition as a badge pair, an optional note, and a footer
 * with the actor (admin email or "Sistem") + timestamp.
 *
 * Styling uses the navy/gold brand tokens: a gold→navy gradient connector
 * line, brand status dot colors per transition target, and a soft card
 * per entry.
 */
export function LeadStatusTimeline({
  histories,
}: {
  histories: LeadStatusHistoryEntry[];
}) {
  if (histories.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider flex items-center gap-1.5">
        <History className="size-3.5 text-gold-600" />
        Riwayat Status
      </h3>
      <ol className="relative space-y-3 pl-5">
        {/* Vertical connector line */}
        <span
          aria-hidden
          className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-gold-400 via-navy-100 to-transparent"
        />
        {histories.map((h) => {
          const fromLabel = h.fromStatus
            ? LEAD_STATUS[h.fromStatus as LeadStatusKey]?.label ?? h.fromStatus
            : "—";
          const toLabel =
            LEAD_STATUS[h.toStatus as LeadStatusKey]?.label ?? h.toStatus;
          const isSystem = h.changedBy === "SYSTEM";
          const actorLabel = isSystem
            ? "Sistem"
            : h.changedBy
              ? h.changedBy
              : "Tidak diketahui";
          const ActorIcon = isSystem ? Bot : UserCog;
          return (
            <li key={h.id} className="relative">
              {/* Timeline dot */}
              <span
                aria-hidden
                className={cn(
                  "absolute -left-5 top-1.5 size-3.5 rounded-full ring-2 ring-white shadow-soft",
                  LEAD_STATUS[h.toStatus as LeadStatusKey]?.dot ?? "bg-navy"
                )}
              />
              <div className="rounded-lg border border-border bg-white p-2.5 shadow-soft">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-ink-soft">{fromLabel}</span>
                  <ArrowRight className="size-3 text-ink-soft" />
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 px-1.5 text-[10px]",
                      leadStatusBadgeClass(h.toStatus)
                    )}
                  >
                    {toLabel}
                  </Badge>
                </div>
                {h.note && (
                  <p className="mt-1.5 text-xs text-ink leading-relaxed">
                    {h.note}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-soft">
                  <ActorIcon className="size-3" />
                  <span>{actorLabel}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={h.createdAt}>{formatDate(h.createdAt)}</time>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

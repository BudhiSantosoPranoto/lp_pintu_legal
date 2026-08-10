/**
 * Shared lead-status metadata used by leads table, dashboard,
 * and any future status badges. Centralized so colors stay consistent.
 */
import { cn } from "@/lib/utils";

export type LeadStatusKey =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CONVERTED"
  | "LOST";

/**
 * A single status-transition audit entry. `fromStatus` is null for the very
 * first record (the lead's creation). `changedBy` is the admin email or
 * the literal "SYSTEM" for automated transitions.
 */
export type LeadStatusHistoryEntry = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
};

export const LEAD_STATUS: Record<
  LeadStatusKey,
  { label: string; badge: string; dot: string }
> = {
  NEW: {
    label: "Baru",
    badge: "bg-gold-100 text-gold-600 border-gold-200",
    dot: "bg-gold",
  },
  CONTACTED: {
    label: "Dihubungi",
    badge: "bg-navy-100 text-navy border-navy/15",
    dot: "bg-navy",
  },
  QUALIFIED: {
    label: "Qualified",
    badge: "bg-gold-200 text-gold-600 border-gold-400/50",
    dot: "bg-gold-600",
  },
  CONVERTED: {
    label: "Terkonversi",
    badge: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-600",
  },
  LOST: {
    label: "Hilang",
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export const LEAD_STATUS_ORDER: LeadStatusKey[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
];

export function leadStatusBadgeClass(status: string): string {
  const key = (status as LeadStatusKey) in LEAD_STATUS
    ? (status as LeadStatusKey)
    : "NEW";
  return cn("font-medium", LEAD_STATUS[key].badge);
}

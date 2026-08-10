import { cn } from "@/lib/utils";

/**
 * Action-badge metadata for the activity log. Each action gets a short
 * Indonesian label + a Tailwind class fragment for the badge tone, so the
 * table can render color-coded chips without a big switch statement.
 *
 * Tones are grouped by entity family:
 *   - Auth  (LOGIN, LOGOUT)              → navy
 *   - Lead  (*_UPDATE)                   → gold
 *   - Lead  (*_DELETE / *_BULK_DELETE)   → red
 *   - Blog  (*_CREATE / *_UPDATE)        → emerald
 *   - Blog  (*_DELETE)                   → red
 *   - Service (*_CREATE / *_UPDATE)      → slate
 *   - Service (*_DELETE)                 → red
 */

export type ActionMeta = { label: string; tone: string };

const TONES = {
  navy: "bg-navy-100 text-navy border-navy/15",
  gold: "bg-gold-100 text-gold-600 border-gold-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  red: "bg-red-100 text-red-700 border-red-200",
} as const;

const ACTION_META: Record<string, ActionMeta> = {
  LOGIN: { label: "Login", tone: TONES.navy },
  LOGOUT: { label: "Logout", tone: TONES.navy },
  LEAD_STATUS_UPDATE: { label: "Update Status Lead", tone: TONES.gold },
  LEAD_DELETE: { label: "Hapus Lead", tone: TONES.red },
  LEAD_BULK_UPDATE: { label: "Update Massal Lead", tone: TONES.gold },
  LEAD_BULK_DELETE: { label: "Hapus Massal Lead", tone: TONES.red },
  BLOG_CREATE: { label: "Buat Artikel", tone: TONES.emerald },
  BLOG_UPDATE: { label: "Perbarui Artikel", tone: TONES.emerald },
  BLOG_DELETE: { label: "Hapus Artikel", tone: TONES.red },
  SERVICE_CREATE: { label: "Buat Layanan", tone: TONES.slate },
  SERVICE_UPDATE: { label: "Perbarui Layanan", tone: TONES.slate },
  SERVICE_DELETE: { label: "Hapus Layanan", tone: TONES.red },
};

const DEFAULT_META: ActionMeta = {
  label: "Aksi",
  tone: TONES.slate,
};

export function actionMeta(action: string): ActionMeta {
  return ACTION_META[action] ?? DEFAULT_META;
}

/** Friendly Indonesian label for an entity type slug. */
const ENTITY_LABELS: Record<string, string> = {
  lead: "Lead",
  blog_post: "Artikel",
  service: "Layanan",
  faq: "FAQ",
  testimonial: "Testimoni",
};

export function entityLabel(entityType: string | null | undefined): string | null {
  if (!entityType) return null;
  return ENTITY_LABELS[entityType] ?? entityType;
}

/**
 * Render the `detail` JSON column as a compact, human-readable string. The
 * detail blob is action-specific, so we just stringify the keys we know about
 * and fall back to the raw JSON for unknown shapes.
 */
export function renderDetail(
  detail: string | null,
  action: string
): string | null {
  if (!detail) return null;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(detail);
  } catch {
    return detail;
  }
  if (!parsed || typeof parsed !== "object") return detail;

  // Action-specific pretty-printing.
  switch (action) {
    case "LEAD_STATUS_UPDATE":
      return [
        parsed.fromStatus ? `dari ${parsed.fromStatus}` : null,
        parsed.toStatus ? `ke ${parsed.toStatus}` : null,
        parsed.statusChanged === false ? "(tidak berubah)" : null,
      ]
        .filter(Boolean)
        .join(" ");
    case "LEAD_BULK_UPDATE":
      return [
        parsed.toStatus ? `ke ${parsed.toStatus}` : null,
        typeof parsed.affected === "number"
          ? `${parsed.affected} lead`
          : null,
        typeof parsed.skipped === "number" && parsed.skipped > 0
          ? `· ${parsed.skipped} tanpa perubahan`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
    case "LEAD_BULK_DELETE":
    case "LEAD_DELETE":
      return [
        typeof parsed.name === "string" ? parsed.name : null,
        typeof parsed.count === "number" ? `${parsed.count} lead` : null,
      ]
        .filter(Boolean)
        .join(" · ");
    case "BLOG_CREATE":
    case "BLOG_UPDATE":
    case "BLOG_DELETE":
      return [
        typeof parsed.title === "string" ? parsed.title : null,
        typeof parsed.slug === "string" ? `/${parsed.slug}` : null,
        typeof parsed.status === "string" ? `(${parsed.status})` : null,
      ]
        .filter(Boolean)
        .join(" ");
    case "SERVICE_CREATE":
    case "SERVICE_UPDATE":
    case "SERVICE_DELETE":
      return [
        typeof parsed.name === "string" ? parsed.name : null,
        typeof parsed.slug === "string" ? `/${parsed.slug}` : null,
      ]
        .filter(Boolean)
        .join(" ");
    default:
      return JSON.stringify(parsed);
  }
}

/** Convenience wrapper used by the table to render an action badge. */
export function ActionBadge({
  action,
  className,
}: {
  action: string;
  className?: string;
}) {
  const meta = actionMeta(action);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap",
        meta.tone,
        className
      )}
    >
      {meta.label}
    </span>
  );
}

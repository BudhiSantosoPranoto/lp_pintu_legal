/**
 * Lead Scoring Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Deterministic, side-effect-free scoring of a lead based on its completeness
 * and engagement signals. Used by:
 *   - Admin leads table (per-row score badge)
 *   - Admin dashboard (lead score distribution card)
 *   - Excel / CSV exports (Skor column)
 *
 * Scoring rules (cap 100, floor 0):
 *   - Has email                → +15
 *   - Has businessName         → +20
 *   - Has serviceId            → +25
 *   - Message length > 50      → +15
 *   - Message length > 100     → +10 (additional, total +25 for >100)
 *   - Source = WEBSITE         → +10
 *   - Source = WHATSAPP        → +15 (highest intent inbound channel)
 *   - Status = QUALIFIED       → +20
 *   - Status = CONTACTED       → +10
 *   - Status = CONVERTED       → +30
 *   - Status = LOST            → -20
 *
 * Tiers:
 *   - high   → 70–100 (gold)
 *   - medium → 40–69  (navy)
 *   - low    → 0–39   (gray)
 *
 * The function takes a plain shape (no Prisma types, no DB calls) so it can be
 * called from both server and client code without coupling to the ORM.
 */

export type LeadScoreInput = {
  email?: string | null;
  businessName?: string | null;
  serviceId?: string | null;
  message?: string;
  source?: string;
  status?: string;
};

export type LeadScoreTier = "high" | "medium" | "low";

export type LeadScoreResult = {
  /** 0–100, clamped. */
  score: number;
  tier: LeadScoreTier;
  /** Human-readable Bahasa Indonesia reasons, ordered as added. */
  factors: string[];
};

const TIER_THRESHOLDS: { min: number; tier: LeadScoreTier }[] = [
  { min: 70, tier: "high" },
  { min: 40, tier: "medium" },
  { min: 0, tier: "low" },
];

function tierFor(score: number): LeadScoreTier {
  for (const t of TIER_THRESHOLDS) {
    if (score >= t.min) return t.tier;
  }
  return "low";
}

/**
 * Pure function — no I/O, no Date, no Math.random. Given a lead shape, returns
 * its deterministic score, tier, and the list of contributing factors.
 *
 * Empty strings are treated as missing (so `email: ""` does NOT earn points).
 */
export function calculateLeadScore(lead: LeadScoreInput): LeadScoreResult {
  let score = 0;
  const factors: string[] = [];

  // ─── Completeness ────────────────────────────────────────────────────────
  const email = (lead.email ?? "").trim();
  if (email.length > 0) {
    score += 15;
    factors.push("Email tersedia");
  }

  const businessName = (lead.businessName ?? "").trim();
  if (businessName.length > 0) {
    score += 20;
    factors.push("Nama usaha diisi");
  }

  const serviceId = (lead.serviceId ?? "").trim();
  if (serviceId.length > 0) {
    score += 25;
    factors.push("Layanan dipilih");
  }

  // ─── Message depth (additive: >50 = +15, then >100 = +10 more) ───────────
  const message = lead.message ?? "";
  if (message.length > 100) {
    score += 25; // 15 + 10
    factors.push("Pesan sangat detail (>100 karakter)");
  } else if (message.length > 50) {
    score += 15;
    factors.push("Pesan cukup detail (>50 karakter)");
  }

  // ─── Source intent ───────────────────────────────────────────────────────
  const source = (lead.source ?? "").toUpperCase();
  if (source === "WHATSAPP") {
    score += 15;
    factors.push("Sumber WhatsApp (intent tinggi)");
  } else if (source === "WEBSITE") {
    score += 10;
    factors.push("Sumber website");
  }

  // ─── Status engagement ───────────────────────────────────────────────────
  const status = (lead.status ?? "").toUpperCase();
  if (status === "CONVERTED") {
    score += 30;
    factors.push("Sudah terkonversi");
  } else if (status === "QUALIFIED") {
    score += 20;
    factors.push("Status qualified");
  } else if (status === "CONTACTED") {
    score += 10;
    factors.push("Sudah dihubungi");
  } else if (status === "LOST") {
    score -= 20;
    factors.push("Lead hilang");
  }

  // Clamp 0–100.
  const clamped = Math.max(0, Math.min(100, score));

  return {
    score: clamped,
    tier: tierFor(clamped),
    factors,
  };
}

/** Convenience: returns just the score, for use in sort comparators. */
export function leadScore(lead: LeadScoreInput): number {
  return calculateLeadScore(lead).score;
}

/**
 * Aggregates a list of leads into high/medium/low tier counts + average score.
 * Returns zeros when the list is empty (no NaN). Used by the dashboard
 * distribution card.
 */
export function summarizeLeadScores(
  leads: LeadScoreInput[]
): {
  high: number;
  medium: number;
  low: number;
  average: number;
  total: number;
} {
  if (leads.length === 0) {
    return { high: 0, medium: 0, low: 0, average: 0, total: 0 };
  }
  let high = 0;
  let medium = 0;
  let low = 0;
  let sum = 0;
  for (const lead of leads) {
    const result = calculateLeadScore(lead);
    sum += result.score;
    if (result.tier === "high") high++;
    else if (result.tier === "medium") medium++;
    else low++;
  }
  return {
    high,
    medium,
    low,
    average: Math.round(sum / leads.length),
    total: leads.length,
  };
}

/** Tailwind class strings for the per-tier badge. */
export const LEAD_SCORE_TIER_BADGE: Record<LeadScoreTier, string> = {
  high: "bg-gold-100 text-gold-600 border-gold-200",
  medium: "bg-navy-100 text-navy border-navy/15",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};

/** Bahasa Indonesia label for each tier. */
export const LEAD_SCORE_TIER_LABEL: Record<LeadScoreTier, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

/**
 * In-memory lead scoring cache.
 *
 * Caches calculated lead scores keyed by lead ID. Scores are invalidated
 * when the lead is updated (status change, note added, etc.) via the
 * `invalidateLeadScore()` function called from the lead update API.
 *
 * Cache TTL: 5 minutes (scores auto-expire to handle edge cases where
 * invalidation is missed).
 */

import { calculateLeadScore, type LeadScoreInput } from "./lead-scoring";

type CachedScore = {
  score: number;
  tier: "high" | "medium" | "low";
  factors: string[];
  calculatedAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CachedScore>();

/**
 * Get or calculate a lead's score, using cache when available.
 */
export function getCachedLeadScore(leadId: string, lead: LeadScoreInput) {
  const cached = cache.get(leadId);
  const now = Date.now();

  if (cached && now - cached.calculatedAt < CACHE_TTL_MS) {
    return cached;
  }

  const result = calculateLeadScore(lead);
  const entry: CachedScore = {
    ...result,
    calculatedAt: now,
  };
  cache.set(leadId, entry);
  return entry;
}

/**
 * Invalidate a single lead's cached score.
 * Call this when a lead is updated (status change, note added, etc.).
 */
export function invalidateLeadScore(leadId: string) {
  cache.delete(leadId);
}

/**
 * Invalidate all cached lead scores.
 * Call this when bulk updates occur.
 */
export function invalidateAllLeadScores() {
  cache.clear();
}

/**
 * Get scores for multiple leads, using cache when available.
 * Returns a Map of leadId → score result.
 */
export function getCachedLeadScores(
  leads: Array<{ id: string } & LeadScoreInput>
) {
  const results = new Map<string, CachedScore>();
  for (const lead of leads) {
    results.set(lead.id, getCachedLeadScore(lead.id, lead));
  }
  return results;
}

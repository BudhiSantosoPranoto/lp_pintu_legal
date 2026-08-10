/**
 * Estimate reading time for a piece of long-form content.
 *
 * Uses the standard ~200 words/minute reading speed and returns the number
 * of minutes as an integer (rounded, with a floor of 1 — even short blurbs
 * take at least a minute to read).
 *
 * Works for plain text or markdown (markdown symbols like `**`, `#`, `-`
 * don't materially affect the word count, and stripping them would only
 * add noise — the split-on-whitespace approach is robust enough here).
 *
 * @param content long-form text (blog post body, article, etc.)
 * @returns whole-minute reading estimate (min 1)
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

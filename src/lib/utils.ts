import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Slugify a string for use as an HTML element id / anchor.
 *
 * Lowercases, strips diacritics (NFD), removes non-alphanumerics
 * (keeping spaces and hyphens), and joins words with single hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\*\*/g, "") // strip markdown bold markers
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Return a unique slug given a base slug and a running seen-map.
 * First occurrence returns the base; subsequent ones append `-2`, `-3`, …
 * The seen Map is mutated in place so callers can pass one map across
 * many calls to guarantee uniqueness within a single document.
 */
export function uniqueSlug(base: string, seen: Map<string, number>): string {
  if (!base) base = "bagian";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

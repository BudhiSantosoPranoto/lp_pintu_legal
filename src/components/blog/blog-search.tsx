"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type BlogSearchCategory = { slug: string; name: string };

/**
 * Search input + category filter for the blog listing.
 *
 * Pure presentational component: it receives the current value + callback
 * and renders the shadcn-styled controls. State lives in the parent
 * (BlogListClient) so the same debounced value drives the grid render.
 */
export function BlogSearch({
  query,
  onQueryChange,
  categories,
  category,
  onCategoryChange,
  resultsCount,
  className,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  categories: BlogSearchCategory[];
  category: string;
  onCategoryChange: (v: string) => void;
  resultsCount: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3",
        className
      )}
    >
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/70"
        />
        <label htmlFor="blog-search" className="sr-only">
          Cari artikel
        </label>
        <Input
          id="blog-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Cari artikel…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-11 rounded-xl border-border bg-white pl-9 pr-9 text-sm shadow-soft placeholder:text-ink-soft/70 focus-visible:border-gold-400 focus-visible:ring-gold-200/60"
        />
        {query.length > 0 && (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={() => onQueryChange("")}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-surface-alt hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="sm:w-56">
        <label htmlFor="blog-category" className="sr-only">
          Filter kategori
        </label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger
            id="blog-category"
            aria-label="Filter kategori"
            className="h-11 w-full rounded-xl border-border bg-white text-sm shadow-soft focus-visible:border-gold-400 focus-visible:ring-gold-200/60"
          >
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p
        aria-live="polite"
        className="hidden text-xs text-ink-soft sm:block sm:w-28 sm:shrink-0 sm:text-right"
      >
        {resultsCount} artikel
      </p>
    </div>
  );
}

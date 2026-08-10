"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, SearchX, Tag as TagIcon, X } from "lucide-react";
import { BlogCard } from "@/components/site/blog-card";
import { BlogSearch, type BlogSearchCategory } from "./blog-search";
import { BlogPagination } from "./blog-pagination";
import { cn } from "@/lib/utils";

export type BlogListPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: string | null; // ISO string (serialized from Date on the server)
  category: { name: string; slug: string } | null;
  tags: string[]; // parsed lowercase tags
};

export type BlogListTag = { tag: string; count: number };

/**
 * Client-side blog listing state container.
 *
 * Receives the full published-posts list (already serialized to plain
 * objects) and the unique categories + tag-cloud list as props from the
 * server page. Manages:
 *   - debounced search query (300 ms) filtering title + excerpt
 *   - category filter (URL-safe slug, "all" for semua)
 *   - tag filter (URL-deep-linked via ?tag=xxx)
 *
 * Renders the filtered grid using the existing BlogCard component.
 */
export function BlogListClient({
  posts,
  categories,
  tags,
}: {
  posts: BlogListPost[];
  categories: BlogSearchCategory[];
  tags: BlogListTag[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rawQuery, setRawQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  // Tag filter is initialized from the ?tag= URL param so deep links work
  // (e.g. navigating from a tag pill on the blog detail page). Clicking a
  // tag chip updates both React state AND the URL via router.replace so
  // the shareable link reflects the active filter.
  const tagParam = searchParams.get("tag")?.trim().toLowerCase() ?? "";
  const [tag, setTag] = React.useState(tagParam);
  const [page, setPage] = React.useState(1);

  const POSTS_PER_PAGE = 9;

  // Debounce the search input by 300 ms so typing stays smooth.
  React.useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // Sync local tag state with URL param changes (e.g. back/forward).
  React.useEffect(() => {
    setTag(tagParam);
  }, [tagParam]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [query, category, tag]);

  const isFiltering = query.length > 0 || category !== "all" || tag.length > 0;

  function selectTag(next: string) {
    const value = next === tag ? "" : next;
    setTag(value);
    // Reflect in URL without scrolling — shareable + back button friendly.
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("tag", value);
    else params.delete("tag");
    const qs = params.toString();
    router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
  }

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter((p) => {
      if (category !== "all" && p.category?.slug !== category) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
      );
    });
  }, [posts, query, category, tag]);

  // The featured post is the newest published post (already sorted desc
  // by the server). Show it only when the user isn't filtering.
  const featured = !isFiltering ? posts[0] : null;
  const rest = filtered.filter((p) => p.id !== featured?.id);

  // Pagination
  const totalPages = Math.ceil(rest.length / POSTS_PER_PAGE);
  const paginatedRest = rest.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div>
      {/* Sticky search/filter bar */}
      <div className="sticky top-16 z-30 -mx-5 mb-10 border-b border-border bg-white/85 px-5 py-4 backdrop-blur-md sm:top-[72px] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <BlogSearch
            query={rawQuery}
            onQueryChange={setRawQuery}
            categories={categories}
            category={category}
            onCategoryChange={setCategory}
            resultsCount={filtered.length}
          />

          {/* Tag cloud row — only render when there are tags to show */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                <TagIcon className="h-3 w-3" />
                Tag
              </span>
              {tags.map(({ tag: t, count }) => {
                const active = t === tag;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => selectTag(t)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-navy bg-navy text-white shadow-soft"
                        : "border-border bg-white text-ink-soft hover:border-gold-200 hover:bg-gold-50 hover:text-gold-600"
                    )}
                  >
                    <span className={cn(
                      "h-1 w-1 rounded-full",
                      active ? "bg-gold" : "bg-gold-400"
                    )} />
                    {t}
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      active ? "bg-white/15 text-white" : "bg-surface-alt text-ink-soft"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
              {tag && (
                <button
                  type="button"
                  onClick={() => selectTag(tag)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-alt"
                  aria-label="Hapus filter tag"
                >
                  <X className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-10 text-center">
          <SearchX className="mx-auto h-8 w-8 text-ink-soft/60" />
          <p className="mt-3 text-sm font-medium text-navy">
            Tidak ada artikel yang cocok
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Coba ubah kata kunci, kategori, atau tag lain.
          </p>
          {isFiltering && (
            <button
              type="button"
              onClick={() => {
                setRawQuery("");
                setCategory("all");
                selectTag(tag); // clears active tag (if any)
              }}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-600 hover:text-gold"
            >
              Reset filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Featured post (only when not filtering) */}
          <AnimatePresence initial={false}>
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <FeaturedPost post={featured} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section heading above the grid */}
          <h2
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.18em] text-gold-600",
              featured ? "mt-14" : "mt-0"
            )}
          >
            {isFiltering
              ? tag
                ? `Hasil untuk tag "${tag}"`
                : "Hasil pencarian"
              : "Artikel Terbaru"}
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedRest.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(i * 0.05, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <BlogCard post={p} className="h-full" />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10">
              <BlogPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Featured post (wider card) ────────────────────────────────────────────

function FeaturedPost({ post }: { post: BlogListPost }) {
  const catName = post.category?.name ?? "Artikel";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:border-gold-200 lg:grid-cols-2"
    >
      {/* Image placeholder */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-navy to-navy-600 lg:aspect-auto lg:min-h-[320px]"
        aria-hidden
      >
        <div className="bg-grid-navy absolute inset-0 opacity-50" />
        <div className="absolute inset-0 flex items-end p-5">
          {post.category ? (
            <Link
              href={`/blog/category/${post.category.slug}`}
              onClick={(e) => e.stopPropagation()}
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy shadow-soft backdrop-blur-sm transition-colors hover:bg-gold-50 hover:text-gold-600"
              aria-label={`Lihat semua artikel dalam kategori ${post.category.name}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {catName}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy shadow-soft backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {catName}
            </span>
          )}
        </div>
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-gold/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy shadow-soft">
          Unggulan
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
        <h2 className="text-balance text-2xl font-bold leading-snug text-navy transition-colors group-hover:text-gold-600 sm:text-3xl">
          {post.title}
        </h2>
        <p className="text-base leading-relaxed text-ink-soft line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
            {(post.authorName || "PL")
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-medium text-navy">{post.authorName}</p>
            <p className="text-xs text-ink-soft">Artikel unggulan</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-gold-600 transition-colors group-hover:text-gold">
            Baca selengkapnya
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

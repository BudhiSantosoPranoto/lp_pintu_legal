"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: Date | null;
  category: { name: string; slug: string } | null;
  featuredImage?: string | null;
  // Tags — either a parsed string[] (preferred, from serialized client data)
  // or the raw comma-separated DB column string (from server-rendered detail
  // page sidebars that pass the raw Prisma object). Both are accepted.
  tags?: string[] | string;
};

function formatDate(d: Date | null) {
  if (!d) return "";
  return format(d, "d MMMM yyyy", { locale: idLocale });
}

/**
 * Magazine-style blog card. Renders `post.featuredImage` with `next/image`
 * (lazy-loaded) when available, falling back to a deterministic navy
 * gradient placeholder with a door watermark.
 *
 * The category badge is a Next.js <Link> to the category page. We
 * `stopPropagation` on the click so it doesn't trigger the card's main
 * link (which would otherwise navigate to the article instead).
 */
export function BlogCard({
  post,
  className,
}: {
  post: BlogCardPost;
  className?: string;
}) {
  const gradIndex = post.slug.charCodeAt(0) % GRADIENTS.length;
  const grad = GRADIENTS[gradIndex];
  const catName = post.category?.name ?? "Artikel";
  // Normalize tags to a clean lowercase string[]. Accepts either a parsed
  // array (preferred — from the serialized blog-listing client) or the raw
  // comma-separated DB column string (from server-rendered detail page
  // sidebars that pass the raw Prisma object).
  const parsedTags = React.useMemo(() => {
    if (!post.tags) return [] as string[];
    if (Array.isArray(post.tags)) return post.tags;
    const seen = new Set<string>();
    const out: string[] = [];
    for (const piece of post.tags.split(",")) {
      const t = piece.trim().toLowerCase().slice(0, 30);
      if (!t || seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
    return out;
  }, [post.tags]);
  // Show up to 3 tags as small pills at the bottom of the card.
  const cardTags = parsedTags.slice(0, 3);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg hover:border-gold-200",
        className
      )}
    >
      {/* Featured image OR gradient placeholder with door watermark */}
      <div
        className={cn(
          "relative aspect-[16/9] w-full overflow-hidden",
          // Always apply the gradient as a background — when there's a real
          // featured image, it covers the gradient; when there isn't, the
          // gradient + watermark shows through.
          grad.bg
        )}
        aria-hidden
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            placeholder="empty"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <>
            <div className={cn("absolute inset-0 opacity-60", grad.pattern)} />
            {/* Door watermark */}
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10"
              width="80"
              height="80"
              viewBox="0 0 200 200"
              fill="none"
            >
              <path d="M50 170 L50 80 Q50 30 100 30 L100 170 Z" fill="#FFFFFF" />
              <path d="M100 170 L100 80 Q100 30 150 30 L150 170 Z" fill="#FFFFFF" />
              <circle cx="82" cy="100" r="5" fill="#C89B3C" />
              <circle cx="118" cy="100" r="5" fill="#C89B3C" />
            </svg>
          </>
        )}
        <div className="absolute inset-0 flex items-end p-4">
          {post.category ? (
            <Link
              href={`/blog/category/${post.category.slug}`}
              onClick={(e) => e.stopPropagation()}
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy shadow-soft backdrop-blur-sm transition-colors hover:bg-gold-50 hover:text-gold-600"
              aria-label={`Lihat semua artikel dalam kategori ${post.category.name}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {catName}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy shadow-soft backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {catName}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex h-full flex-1 flex-col p-5">
        <h3 className="text-balance text-base font-bold leading-snug text-navy transition-colors group-hover:text-gold-600 sm:text-lg">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
          {post.excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-navy">
              {post.authorName}
            </p>
            <p className="text-[11px] text-ink-soft">
              {formatDate(post.publishedAt)}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gold-600 transition-colors group-hover:text-gold">
            Baca
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>

        {/* Tags — up to 3 small gold-50 pills. Each links to /blog?tag=xxx.
            stopPropagation so clicks don't trigger the card's main link. */}
        {cardTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cardTags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                onClick={(e) => e.stopPropagation()}
                prefetch={false}
                className="inline-flex items-center rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-600 ring-1 ring-gold-100 transition-colors hover:bg-gold-100 hover:text-gold-600"
                aria-label={`Lihat artikel dengan tag ${t}`}
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

const GRADIENTS = [
  {
    bg: "bg-gradient-to-br from-navy to-navy-600",
    pattern: "bg-grid-navy",
  },
  {
    bg: "bg-gradient-to-br from-navy-600 to-navy-400",
    pattern: "bg-grid-navy",
  },
  {
    bg: "bg-gradient-to-br from-[#1B3D6A] to-[#274B7E]",
    pattern: "bg-grid-navy",
  },
] as const;

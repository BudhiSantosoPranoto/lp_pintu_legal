import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Enhanced author bio card shown at the bottom of blog articles.
 *
 * Defaults reflect the brand's house author "Tim Pintu Legal" — a navy
 * gradient card with a circular avatar showing the "PL" monogram, the
 * author name, a one-line bio, and a CTA back to the blog index.
 */
export function AuthorBio({
  authorName = "Tim Pintu Legal",
  initials = "PL",
  bio = "Tim Pintu Legal menulis panduan dan insight seputar legalitas bisnis untuk membantu pelaku usaha di Indonesia.",
  ctaLabel = "Lihat semua artikel",
  ctaHref = "/blog",
}: {
  authorName?: string;
  initials?: string;
  bio?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section
      aria-label="Tentang penulis"
      className="relative overflow-hidden rounded-2xl bg-navy-mesh shadow-soft-lg"
    >
      <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="relative z-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-7 lg:p-8">
        {/* Avatar */}
        <div className="flex shrink-0 items-center sm:items-start">
          <span
            className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xl font-bold tracking-tight text-navy shadow-gold ring-4 ring-white/10"
            aria-hidden
          >
            {initials}
          </span>
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">
            Ditulis oleh
          </p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            {authorName}
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-[15px]">
            {bio}
          </p>

          <div className="mt-5">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy shadow-soft transition-all hover:bg-gold-50 hover:ring-2 hover:ring-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

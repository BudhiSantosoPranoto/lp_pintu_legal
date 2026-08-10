import { getTestimonials } from "@/data/queries";
import { SectionHeading, Reveal } from "@/components/site/section-primitives";
import { TestimonialsCarousel } from "@/components/site/testimonials-carousel";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Homepage testimonials section.
 *
 * Per master prompt: do NOT fabricate testimonials. This section only renders
 * when there are ACTIVE testimonials in the database (added via /admin/testimonials).
 * When empty, it renders nothing — keeping the page clean and honest.
 *
 * Layout:
 * - 1-3 testimonials: 3-col grid of cards
 * - 4+ testimonials: carousel (one card at a time, auto-advancing)
 */
export async function TestimonialsSection() {
  const testimonials = await getTestimonials(6);

  // Don't render the section at all if there are no real testimonials.
  if (testimonials.length === 0) return null;

  const useCarousel = testimonials.length >= 4;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative scroll-mt-24 bg-surface-alt py-20 sm:py-24"
    >
      {/* Subtle door watermark decoration */}
      <svg
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03]"
        width="400"
        height="400"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
      >
        <path d="M50 170 L50 80 Q50 30 100 30 L100 170 Z" fill="#0F2747" />
        <path d="M100 170 L100 80 Q100 30 150 30 L150 170 Z" fill="#0F2747" />
        <circle cx="82" cy="100" r="5" fill="#C89B3C" />
        <circle cx="118" cy="100" r="5" fill="#C89B3C" />
      </svg>

      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Testimoni"
          title="Apa Kata Mereka"
          description="Cerita dari pelaku usaha yang telah mempercayakan kebutuhan legalitas bisnisnya kepada Pintu Legal."
        />

        {useCarousel ? (
          <Reveal className="mt-12">
            <TestimonialsCarousel
              items={testimonials.map((t) => ({
                id: t.id,
                name: t.name,
                company: t.company,
                role: t.role,
                quote: t.quote,
                rating: t.rating,
              }))}
            />
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={(i % 3) * 0.08}>
                <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                  {/* Quote icon */}
                  <span
                    className="absolute right-5 top-5 text-gold-200 transition-colors group-hover:text-gold-300"
                    aria-hidden
                  >
                    <Quote className="h-8 w-8" fill="currentColor" />
                  </span>

                  {/* Rating */}
                  {t.rating > 0 && (
                    <div
                      className="flex gap-0.5"
                      aria-label={`Rating ${t.rating} dari 5`}
                    >
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={cn(
                            "h-4 w-4",
                            idx < t.rating
                              ? "fill-gold text-gold"
                              : "fill-transparent text-border"
                          )}
                          aria-hidden
                        />
                      ))}
                    </div>
                  )}

                  {/* Quote */}
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <footer className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white ring-2 ring-gold/20">
                      {t.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">
                        {t.name}
                      </p>
                      {(t.role || t.company) && (
                        <p className="truncate text-xs text-ink-soft">
                          {[t.role, t.company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </footer>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

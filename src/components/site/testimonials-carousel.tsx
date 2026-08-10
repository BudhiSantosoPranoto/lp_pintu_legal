"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  quote: string;
  rating: number;
};

/**
 * Premium testimonials carousel.
 *
 * Shows one testimonial at a time on mobile, with smooth slide transitions.
 * On desktop, shows the active card prominently with navigation controls.
 * Auto-advances every 6 seconds (paused on hover). Respects prefers-reduced-motion.
 */
export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const reduceMotion = useReducedMotion();

  const count = items.length;

  const goNext = React.useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const goPrev = React.useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  // Auto-advance
  React.useEffect(() => {
    if (paused || reduceMotion || count <= 1) return;
    const t = setInterval(goNext, 6000);
    return () => clearInterval(t);
  }, [paused, reduceMotion, count, goNext]);

  if (count === 0) return null;

  const active = items[index];

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-soft-lg sm:p-10">
        {/* Quote watermark */}
        <Quote
          className="absolute right-6 top-6 h-20 w-20 text-gold-100"
          fill="currentColor"
          aria-hidden
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active.id}
            custom={direction}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Rating */}
            <div className="flex gap-0.5" aria-label={`Rating ${active.rating} dari 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < active.rating ? "fill-gold text-gold" : "fill-transparent text-border"
                  )}
                  aria-hidden
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mt-5 text-balance text-lg font-medium leading-relaxed text-navy sm:text-xl">
              &ldquo;{active.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <footer className="mt-6 flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white ring-2 ring-gold/30">
                {active.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-navy">{active.name}</p>
                {(active.role || active.company) && (
                  <p className="text-sm text-ink-soft">
                    {[active.role, active.company].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </footer>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={count <= 1}
          aria-label="Testimoni sebelumnya"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-navy shadow-soft transition-all hover:border-navy hover:bg-navy hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5" role="tablist" aria-label="Pilih testimoni">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimoni ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-8 bg-gold" : "w-2 bg-border hover:bg-navy/30"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={count <= 1}
          aria-label="Testimoni berikutnya"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-navy shadow-soft transition-all hover:border-navy hover:bg-navy hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

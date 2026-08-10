"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { FaqItem } from "@/components/sections/faq-section-client";
import type { Testimonial } from "@/components/site/testimonials-carousel";

/**
 * Lazy-loaded homepage sections.
 *
 * `next/dynamic` with `ssr: false` is only supported inside Client
 * Components (Next.js 16 App Router), so this file acts as the client
 * boundary. The server-rendered page passes already-fetched data as
 * props; this wrapper defers the rendering of the heavy accordion /
 * carousel JS bundles until after hydration so the above-the-fold
 * sections paint faster.
 *
 * SEO note: the FAQ structured data (JSON-LD) is still rendered
 * server-side in `src/app/page.tsx`, so crawlers see the same Q&A pairs
 * regardless of whether the visible accordion has hydrated yet.
 */

const FaqSectionClient = dynamic(
  () =>
    import("@/components/sections/faq-section-client").then(
      (m) => m.FaqSectionClient
    ),
  {
    ssr: false,
    loading: () => <FaqSkeleton />,
  }
);

const TestimonialsSectionClient = dynamic(
  () =>
    import("@/components/sections/testimonials-section-client").then(
      (m) => m.TestimonialsSectionClient
    ),
  {
    ssr: false,
    loading: () => <TestimonialsSkeleton />,
  }
);

export function LazyFaqSection({ faqs }: { faqs: FaqItem[] }) {
  // Render nothing on the client if there are no FAQs — matches the
  // behaviour of the original async FaqSection which always had data.
  if (faqs.length === 0) return null;
  return <FaqSectionClient faqs={faqs} />;
}

export function LazyTestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return <TestimonialsSectionClient testimonials={testimonials} />;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function FaqSkeleton() {
  return (
    <section className="py-20 sm:py-24" aria-busy="true" aria-label="Memuat FAQ">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-72 rounded-md sm:h-11 sm:w-96" />
          <Skeleton className="h-4 w-72 rounded sm:w-96" />
        </div>
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white px-5 py-5 sm:px-7"
            >
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSkeleton() {
  return (
    <section
      className="bg-surface-alt py-20 sm:py-24"
      aria-busy="true"
      aria-label="Memuat testimoni"
    >
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-56 rounded-md sm:h-11 sm:w-72" />
          <Skeleton className="h-4 w-72 rounded sm:w-96" />
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-3xl border border-border bg-white p-8 shadow-soft-lg sm:p-10">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-5 rounded" />
              ))}
            </div>
            <Skeleton className="mt-5 h-5 w-11/12 rounded" />
            <Skeleton className="mt-3 h-5 w-10/12 rounded" />
            <Skeleton className="mt-3 h-5 w-9/12 rounded" />
            <div className="mt-6 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

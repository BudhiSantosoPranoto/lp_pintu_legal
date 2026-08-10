"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading, Reveal } from "@/components/site/section-primitives";

export type FaqItem = { id?: string; question: string; answer: string };

/**
 * Client-side FAQ accordion. Mirrors the markup of the original async
 * `FaqSection` server component so the rendered output is byte-for-byte
 * identical after hydration — only the data source differs (server-fetched
 * vs. server-fetched-and-passed-as-props).
 *
 * Used by `LazyFaqSection` (which wraps this in `next/dynamic` with
 * `ssr: false`) so the accordion JS + content only loads after the
 * above-the-fold sections have painted.
 */
export function FaqSectionClient({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-heading" className="py-20 sm:py-24">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="Pertanyaan yang Sering Diajukan"
          description="Jawaban singkat untuk membantu Anda memahami layanan kami."
        />

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion
              type="single"
              collapsible
              defaultValue={faqs[0]?.id}
              className="rounded-2xl border border-border bg-white px-5 shadow-soft sm:px-7"
            >
              {faqs.map((f, i) => (
                <AccordionItem
                  key={f.id ?? i}
                  value={f.id ?? `faq-${i}`}
                  className="border-border last:border-b-0"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-semibold text-navy hover:no-underline sm:text-[1.05rem]">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 text-center">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-soft transition-colors hover:border-gold-400 hover:text-gold-600"
              >
                Lihat semua FAQ
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

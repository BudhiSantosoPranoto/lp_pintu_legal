import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ServiceTabFaq } from "@/components/layanan/service-tabs";

/**
 * Presentational tab panels used by `ServiceTabs`. Extracted into a
 * separate file so the main `service-tabs.tsx` (which contains the view
 * toggle + scroll view logic) stays under the ~400-line guideline.
 *
 * These components are pure — they take data as props and render the
 * same markup whether they're being shown inside a tab panel or stacked
 * vertically in scroll view.
 */

export function TentangTab({
  description,
  highlights,
}: {
  description: string;
  highlights: string[];
}) {
  return (
    <div className="space-y-10">
      <section>
        <SectionHeading>Tentang Layanan</SectionHeading>
        <p className="mt-4 whitespace-pre-line text-[1.05rem] leading-relaxed text-ink-soft dark:text-muted-foreground">
          {description}
        </p>
      </section>

      {highlights.length > 0 && (
        <section>
          <SectionHeading>Apa yang Termasuk</SectionHeading>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-white p-3.5 shadow-soft dark:bg-card"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                <span className="text-sm leading-snug text-ink-soft dark:text-muted-foreground">
                  {h}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function ProsesTab({ processSteps }: { processSteps: string[] }) {
  if (processSteps.length === 0) {
    return <EmptyTab label="Proses" />;
  }

  return (
    <section>
      <SectionHeading>Alur Proses</SectionHeading>
      <ol className="mt-6 space-y-6 border-l border-navy-100 pl-6 dark:border-white/10">
        {processSteps.map((step, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full bg-navy text-[11px] font-bold text-white ring-4 ring-background dark:ring-card"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="text-[1.05rem] leading-snug text-navy dark:text-foreground">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PersyaratanTab({
  requirements,
  audience,
}: {
  requirements: string[];
  audience: string[];
}) {
  return (
    <div className="space-y-10">
      <section>
        <SectionHeading>Persyaratan &amp; Dokumen</SectionHeading>
        {requirements.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {requirements.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-white p-3.5 shadow-soft dark:bg-card"
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy ring-1 ring-navy-100 dark:bg-white/5 dark:text-foreground dark:ring-white/10">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm leading-snug text-ink-soft dark:text-muted-foreground">
                  {r}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink-soft dark:text-muted-foreground">
            Daftar dokumen yang diperlukan akan dikonfirmasi pada saat
            konsultasi awal.
          </p>
        )}
      </section>

      <section>
        <SectionHeading>
          <Users className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />
          Siapa yang Membutuhkan
        </SectionHeading>
        <ul className="mt-4 space-y-2.5">
          {audience.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
              />
              <span className="text-[1.05rem] leading-relaxed text-ink-soft dark:text-muted-foreground">
                {a}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function FaqTab({ faqs }: { faqs: ServiceTabFaq[] }) {
  return (
    <section>
      <SectionHeading>Pertanyaan Umum</SectionHeading>
      {faqs.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-border bg-white px-5 py-2 shadow-soft sm:px-6 dark:bg-card">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-border last:border-b-0"
              >
                <AccordionTrigger className="text-left text-[15px] font-semibold text-navy hover:no-underline dark:text-foreground">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-ink-soft dark:text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface-alt p-6 text-center dark:bg-white/5">
          <HelpCircle className="mx-auto h-6 w-6 text-gold-600" />
          <p className="mt-3 text-sm text-ink-soft dark:text-muted-foreground">
            Pertanyaan umum untuk layanan ini akan ditambahkan segera.
          </p>
          <Link
            href="/faq"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-600 hover:text-gold"
          >
            Lihat semua FAQ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
      {children}
    </h2>
  );
}

export function EmptyTab({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-8 text-center dark:bg-white/5">
      <p className="text-sm text-ink-soft dark:text-muted-foreground">
        Informasi {label.toLowerCase()} untuk layanan ini akan ditambahkan
        segera.
      </p>
    </div>
  );
}

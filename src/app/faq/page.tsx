import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  ArrowRight,
  HelpCircle,
  Hash,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/site/section-primitives";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFaqs } from "@/data/queries";
import { faqPageJsonLd } from "@/lib/seo";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang sering diajukan seputar layanan legalitas bisnis Pintu Legal — pendirian badan usaha, perizinan, HKI, dan lainnya.",
  alternates: { canonical: "/faq" },
};

/** Slugify a category name into an anchor id (stable & URL-safe). */
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  // Group by category, preserve first-seen order
  const groups: { category: string; items: typeof faqs }[] = [];
  for (const f of faqs) {
    const cat = f.category || "Umum";
    let g = groups.find((x) => x.category === cat);
    if (!g) {
      g = { category: cat, items: [] };
      groups.push(g);
    }
    g.items.push(f);
  }

  const jsonLd = faqPageJsonLd(
    faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <SiteShell>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-alt">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-white to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-gold" />
                FAQ
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Pertanyaan yang Sering Diajukan
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Kumpulan pertanyaan umum seputar layanan dan proses legalitas
                bisnis kami. Tidak menemukan jawaban yang Anda cari? Tim kami
                siap membantu.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FAQ body ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Main column */}
            <div className="lg:col-span-8">
              {groups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-10 text-center">
                  <HelpCircle className="mx-auto h-8 w-8 text-ink-soft/60" />
                  <p className="mt-3 text-sm text-ink-soft">
                    Belum ada FAQ yang tersedia saat ini. Silakan hubungi tim
                    kami untuk pertanyaan Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {groups.map((group, gi) => {
                    const anchor = slugify(group.category);
                    return (
                      <Reveal key={group.category} delay={gi * 0.04} as="section">
                        <div id={anchor} className="scroll-mt-24">
                          <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy-50 text-navy ring-1 ring-navy-100">
                              <Hash className="h-4 w-4" />
                            </span>
                            <h2 className="text-xl font-semibold text-navy sm:text-2xl">
                              {group.category}
                            </h2>
                            <span className="ml-1 rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                              {group.items.length} pertanyaan
                            </span>
                          </div>

                          <div className="mt-5 rounded-2xl border border-border bg-white px-5 shadow-soft sm:px-6">
                            <Accordion type="single" collapsible defaultValue={`item-${gi}-0`} className="w-full">
                              {group.items.map((f, fi) => (
                                <AccordionItem
                                  key={f.id}
                                  value={`item-${gi}-${fi}`}
                                  className="border-b border-border last:border-b-0"
                                >
                                  <AccordionTrigger className="text-left text-[15px] font-semibold text-navy hover:text-navy hover:no-underline">
                                    {f.question}
                                  </AccordionTrigger>
                                  <AccordionContent className="text-sm leading-relaxed text-ink-soft">
                                    {f.answer}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Quick-jump categories */}
                {groups.length > 0 && (
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                      Lompat ke kategori
                    </h3>
                    <ul className="mt-4 space-y-1.5">
                      {groups.map((g) => {
                        const anchor = slugify(g.category);
                        return (
                          <li key={g.category}>
                            <a
                              href={`#${anchor}`}
                              className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-alt hover:text-navy"
                            >
                              <span className="truncate">{g.category}</span>
                              <span className="ml-2 shrink-0 text-xs text-ink-soft/60 group-hover:text-gold">
                                {g.items.length}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Still have questions? */}
                <div className="relative overflow-hidden rounded-2xl bg-navy-mesh p-6 text-white shadow-soft sm:p-7">
                  <div className="absolute inset-0 bg-grid-navy opacity-25" aria-hidden />
                  <div className="relative">
                    <h3 className="text-lg font-semibold leading-snug">
                      Masih punya pertanyaan?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Tim Pintu Legal siap menjawab pertanyaan Anda seputar
                      kebutuhan legalitas bisnis.
                    </p>
                    <div className="mt-5 space-y-2.5">
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-gold text-navy hover:bg-gold-400"
                      >
                        <a
                          href={waLink("Halo Pintu Legal, saya ingin bertanya seputar layanan.")}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Chat WhatsApp
                        </a>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                      >
                        <Link href="/kontak">
                          Form Konsultasi
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </SiteShell>
  );
}

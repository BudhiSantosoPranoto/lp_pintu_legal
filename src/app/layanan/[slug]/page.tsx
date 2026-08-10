import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal, SectionHeading } from "@/components/site/section-primitives";
import { BreadcrumbNav } from "@/components/site/breadcrumb-nav";
import { ServiceIcon } from "@/components/site/service-icon";
import { ServiceSidebar, deriveAudience } from "@/components/site/service-sidebar";
import { ServiceTabs } from "@/components/layanan/service-tabs";
import { ServiceToc } from "@/components/layanan/service-toc";
import { ServiceReadingProgress } from "@/components/layanan/service-reading-progress";
import { ServiceCard } from "@/components/site/service-card";
import { ServiceCtaBand } from "@/components/site/service-cta-band";
import { Button } from "@/components/ui/button";
import {
  getServices,
  getServiceBySlug,
  getRelatedServices,
  getRelevantFaqsForService,
} from "@/data/queries";
import { siteConfig, waLink } from "@/lib/site";
import {
  serviceJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";

type Params = { slug: string };

/** Pre-render all service detail pages at build time. */
export async function generateStaticParams(): Promise<Params[]> {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

/** Per-service SEO metadata. */
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Layanan tidak ditemukan" };

  const title = service.metaTitle ?? `${service.name} — Pintu Legal`;
  const description = service.metaDescription ?? service.shortDescription;

  return {
    title,
    description,
    alternates: { canonical: `/layanan/${service.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/layanan/${service.slug}`,
      siteName: siteConfig.brandName,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const waMessage = `Halo Pintu Legal, saya ingin berkonsultasi mengenai layanan ${service.name}.`;

  // Related services — same category first, filled with others if needed.
  const relatedServices = await getRelatedServices(slug, 3);

  // FAQ inheritance: if the service has no specific FAQs, fetch relevant
  // global FAQs based on keyword matching against the service name + category.
  const serviceFaqs = service.faqs.length > 0
    ? service.faqs
    : (await getRelevantFaqsForService(
        service.name,
        service.category?.name ?? null,
        4
      )).map((f) => ({ q: f.question, a: f.answer }));

  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Layanan", url: "/layanan" },
    { name: service.name, url: `/layanan/${service.slug}` },
  ];

  const jsonLdScripts = [serviceJsonLd(service), breadcrumbJsonLd(crumbs)];
  if (serviceFaqs.length > 0) {
    jsonLdScripts.push(
      faqPageJsonLd(serviceFaqs.map((f) => ({ question: f.q, answer: f.a })))
    );
  }

  return (
    <SiteShell>
      {/* Reading progress bar */}
      <ServiceReadingProgress />

      {/* JSON-LD */}
      {jsonLdScripts.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-alt">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div
          className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-white to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal>
            <BreadcrumbNav
              items={[
                { label: "Home", href: "/" },
                { label: "Layanan", href: "/layanan" },
                { label: service.name },
              ]}
            />
          </Reveal>

          <div className="mt-8 max-w-4xl">
            <Reveal delay={0.05}>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy ring-1 ring-navy-100">
                  <ServiceIcon name={service.icon} className="h-6 w-6" />
                </span>
                {service.category && (
                  <span className="eyebrow">
                    <span className="h-1 w-1 rounded-full bg-gold" />
                    {service.category.name}
                  </span>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {service.name}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                {service.shortDescription}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link href="/kontak">
                    Konsultasi Gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-gold-400 px-6 text-base text-gold-600 hover:bg-gold-50 hover:text-gold-600"
                >
                  <a
                    href={waLink(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Mobile sidebar — visible only on small screens */}
          <Reveal delay={0.25}>
            <div className="mt-8 lg:hidden">
              <ServiceSidebar service={service} waMessage={waMessage} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Body content ──────────────────────────────────────────── */}
      <section id="service-tabs" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="lg:col-span-8">
            <Reveal>
              <ServiceTabs
                description={service.description}
                highlights={service.highlights}
                processSteps={service.processSteps}
                requirements={service.requirements}
                faqs={serviceFaqs}
                audience={deriveAudience(service.slug)}
              />
            </Reveal>
          </div>

          {/* Sticky desktop sidebar with TOC */}
          <aside id="service-sidebar" className="hidden scroll-mt-24 lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-4">
              <ServiceToc />
              <ServiceSidebar service={service} waMessage={waMessage} />
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Related services ───────────────────────────────────────── */}
      {relatedServices.length > 0 && (
        <section id="related-services" className="scroll-mt-24 border-t border-border bg-surface-alt py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="LAYANAN TERKAIT"
              title="Layanan Lain yang Mungkin Anda Butuhkan"
              description="Pelajari layanan terkait untuk melengkapi kebutuhan legalitas bisnis Anda."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.08}>
                  <ServiceCard service={s} className="h-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Final CTA ─────────────────────────────────────────────── */}
      <div id="service-cta" className="scroll-mt-24">
        <ServiceCtaBand
          eyebrow="Konsultasi"
          title={`Butuh informasi lebih lanjut tentang ${service.name}?`}
          description="Tim Pintu Legal siap mendampingi kebutuhan legalitas bisnis Anda. Konsultasi awal tanpa kewajiban."
          waMessage={waMessage}
        />
      </div>
    </SiteShell>
  );
}

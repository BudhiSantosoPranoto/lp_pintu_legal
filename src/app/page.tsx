import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Hero } from "@/components/sections/hero";
import { TrustBar } from "@/components/sections/trust-bar";
import { Services } from "@/components/sections/services";
import { WhyPintuLegal } from "@/components/sections/why-pintu-legal";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PricingCta } from "@/components/sections/pricing-cta";
import { FinalCta } from "@/components/sections/final-cta";
import { SectionDivider } from "@/components/site/section-divider";
import {
  LazyFaqSection,
  LazyTestimonialsSection,
} from "@/components/sections/lazy-sections";
import { getFaqs, getTestimonials } from "@/data/queries";
import { organizationJsonLd, faqPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pintu Legal — Legalitas Bisnis yang Lebih Mudah dan Terarah",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  // Fetch FAQs at top-level for JSON-LD structured data AND as the prop
  // for the lazy-loaded FaqSectionClient. We fetch once and use the same
  // data for both purposes — the JSON-LD is server-rendered (so crawlers
  // always see the Q&A pairs), while the visible accordion is hydrated
  // client-side via next/dynamic({ ssr: false }).
  const faqRows = (await getFaqs()).slice(0, 6);
  const faqs = faqRows.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));

  // Fetch testimonials at top-level and pass as props to the lazy-loaded
  // TestimonialsSectionClient. Testimonials are user-generated content
  // (no JSON-LD), so deferring their render to after hydration is a
  // safe performance win.
  const testimonialRows = await getTestimonials(6);
  const testimonials = testimonialRows.map((t) => ({
    id: t.id,
    name: t.name,
    company: t.company,
    role: t.role,
    quote: t.quote,
    rating: t.rating,
  }));

  const jsonLd = [organizationJsonLd()];
  if (faqs.length > 0) {
    jsonLd.push(
      faqPageJsonLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))
    );
  }

  return (
    <SiteShell>
      {/* Structured data — Organization + FAQPage */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Above-the-fold — direct imports, SSR for SEO */}
      <Hero />
      <TrustBar />
      <Services />
      <SectionDivider variant="light" />

      {/* Below-the-fold — direct imports (still SSR for SEO + content) */}
      <WhyPintuLegal />
      <HowItWorks />

      {/* Below-the-fold — lazy-loaded with ssr:false + skeleton fallback.
          The carousel/accordion JS bundles are deferred until after
          hydration; the FAQ Q&A pairs are still in the JSON-LD above. */}
      <LazyTestimonialsSection testimonials={testimonials} />
      <SectionDivider variant="light" />
      <PricingCta />
      <LazyFaqSection faqs={faqs} />
      <FinalCta />
    </SiteShell>
  );
}

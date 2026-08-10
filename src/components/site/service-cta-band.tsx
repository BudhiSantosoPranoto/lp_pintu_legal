import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/site/section-primitives";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/site";

/**
 * Navy-mesh CTA band with eyebrow, heading, supporting copy, and two CTAs.
 * Reused across `/layanan` (listing) and `/layanan/[slug]` (detail) so the
 * visual treatment stays consistent.
 */
export function ServiceCtaBand({
  eyebrow = "Butuh Bantuan?",
  title,
  description,
  waMessage,
  primaryLabel = "Konsultasi Gratis",
}: {
  eyebrow?: string;
  title: string;
  description: string;
  waMessage: string;
  primaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-mesh">
      <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold ring-1 ring-white/10">
            <span className="h-1 w-1 rounded-full bg-gold" />
            {eyebrow}
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="max-w-2xl text-balance text-3xl font-bold leading-tight text-white sm:text-4xl">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-xl text-base leading-relaxed text-white/70">
            {description}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gold px-6 text-base text-navy shadow-gold hover:bg-gold-400 hover:text-navy"
            >
              <Link href="/kontak">
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <a
                href={waLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Kami
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

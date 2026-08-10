import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/site/section-primitives";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/site";

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-navy-mesh"
    >
      {/* Grid overlay */}
      <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-50" />

      {/* Decorative gold arcs (door shape) — CSS only */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 hidden h-[480px] w-[480px] -translate-y-1/2 rounded-full border border-gold/20 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-[480px] w-[480px] -translate-y-1/2 rounded-full border border-gold/20 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 hidden h-[420px] w-[820px] -translate-x-1/2 rounded-b-full border-b border-gold/15 lg:block"
      />

      <div className="container-px relative z-10 mx-auto max-w-4xl py-20 text-center sm:py-28">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold ring-1 ring-white/10">
            <span className="h-1 w-1 rounded-full bg-gold" />
            Mulai Sekarang
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2
            id="final-cta-heading"
            className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            Sudah siap membuka pintu menuju bisnis yang lebih profesional?
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Konsultasikan kebutuhan legalitas bisnis Anda bersama Pintu Legal.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gold px-6 text-base text-navy shadow-gold hover:bg-gold-400 hover:text-navy"
            >
              <Link href="/kontak">
                Konsultasi Gratis
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
                href={waLink(
                  "Halo Pintu Legal, saya ingin konsultasi mengenai legalitas bisnis."
                )}
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

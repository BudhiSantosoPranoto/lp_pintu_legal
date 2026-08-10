import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import {
  SectionHeading,
  Reveal,
} from "@/components/site/section-primitives";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/site";

export function PricingCta() {
  return (
    <section
      aria-labelledby="pricing-heading"
      className="bg-surface-alt py-20 sm:py-24"
    >
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          id="pricing-heading"
          eyebrow="Penawaran"
          title="Butuh Penawaran?"
          description="Setiap kebutuhan bisnis berbeda. Konsultasikan kebutuhan Anda untuk mendapatkan informasi layanan yang sesuai."
        />

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-soft-lg sm:p-12">
            {/* Decorative gold corner glow */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(200,155,60,0.35), transparent 70%)",
              }}
              aria-hidden
            />

            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy ring-1 ring-navy-100">
                Konsultasi Awal
              </span>

              <h3 className="text-balance text-2xl font-bold text-navy sm:text-3xl">
                Dapatkan informasi layanan yang sesuai dengan bisnis Anda.
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-ink-soft">
                Tim Pintu Legal siap membantu menjelaskan pilihan layanan,
                estimasi waktu proses, serta tahapan yang dibutuhkan — tanpa
                kewajiban.
              </p>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link href="/kontak">
                    Diskusikan Kebutuhan Saya
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
                    href={waLink(
                      "Halo Pintu Legal, saya ingin bertanya mengenai layanan dan penawaran."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat WhatsApp
                  </a>
                </Button>
              </div>

              <p className="text-xs text-ink-soft">
                Tidak ada biaya untuk konsultasi awal. Jawaban akan diberikan
                secepatnya pada jam kerja.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

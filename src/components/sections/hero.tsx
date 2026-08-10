import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { siteConfig, waLink } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/section-primitives";

const avatars = ["PL", "AR", "MK", "DS"];

const docCards = [
  {
    title: "Akta Pendirian",
    sub: "Notaris",
    progress: 100,
    delay: "0s",
    anim: "animate-float-soft",
    className: "left-2 top-6 sm:left-0 sm:top-4 rotate-[-4deg]",
  },
  {
    title: "SK Kemenkumham",
    sub: "Pengesahan",
    progress: 72,
    delay: "0.4s",
    anim: "animate-float-soft-delayed",
    className: "right-2 top-20 sm:right-0 sm:top-24 rotate-[3deg]",
  },
  {
    title: "NIB",
    sub: "OSS · UMKM",
    progress: 48,
    delay: "0.8s",
    anim: "animate-float-soft",
    className: "left-6 bottom-6 sm:left-10 sm:bottom-4 rotate-[-2deg]",
  },
];

function DocCard({
  title,
  sub,
  progress,
  anim,
  className,
  delay,
}: (typeof docCards)[number]) {
  return (
    <div
      className={`absolute w-[170px] rounded-2xl border border-border bg-white p-3.5 shadow-[0_20px_50px_-12px_rgba(15,39,71,0.25)] ring-1 ring-black/[0.02] ${anim} ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden
    >
      <div className="mb-2.5 flex h-7 items-center gap-1.5 rounded-lg bg-navy px-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-white/50">Legal</span>
      </div>
      <div className="mb-1 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-gold-600" />
        <span className="text-[11px] font-medium text-ink-soft">{sub}</span>
      </div>
      <p className="mb-2.5 text-[13px] font-bold tracking-tight text-navy">{title}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="mt-1 block text-right text-[10px] font-medium text-ink-soft">
        {progress}%
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      {/* Background gradient + gold radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)" }}
      />
      <div
        className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[480px] w-[480px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(200,155,60,0.28), transparent 70%)",
        }}
      />

      <div className="container-px mx-auto grid max-w-7xl items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:py-24">
        {/* LEFT */}
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <span className="eyebrow">
              <span className="h-1 w-1 rounded-full bg-gold" />
              Jasa Legalitas Bisnis Indonesia
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1
              id="hero-heading"
              className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.5rem]"
            >
              Membuka Jalan Menuju Bisnis yang{" "}
              <span className="text-gradient-gold">Legal.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {siteConfig.description}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/kontak">
                  Mulai Konsultasi
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                <Link href="/layanan">Lihat Layanan</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex -space-x-2">
                {avatars.map((a) => (
                  <span
                    key={a}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-navy-50 text-[11px] font-bold text-navy ring-1 ring-border"
                  >
                    {a}
                  </span>
                ))}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gold text-white ring-1 ring-gold-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
              <div className="text-sm leading-tight">
                <p className="font-medium text-navy">
                  Pendampingan profesional untuk kebutuhan legalitas bisnis Anda.
                </p>
                <p className="text-ink-soft">
                  Konsultasi awal — hubungi kami via{" "}
                  <a
                    href={waLink("Halo Pintu Legal, saya ingin konsultasi.")}
                    className="font-medium text-gold-600 underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                  .
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* RIGHT — floating document cards illustration */}
        <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[460px] lg:h-[520px]">
          {/* Grid panel with door icon decoration */}
          <div className="bg-grid absolute inset-4 rounded-[1.75rem] border border-border bg-white/70 shadow-soft" />
          <Image
            src="/images/pintu-legal-icon.png"
            alt=""
            width={240}
            height={240}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-25 sm:h-[240px] sm:w-[240px]"
            aria-hidden
          />
          {/* Preview badge */}
          <span className="absolute right-6 top-2 z-20 inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-soft">
            Preview
          </span>
          {/* Status pill */}
          <span className="absolute bottom-2 left-6 z-20 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy shadow-soft-lg ring-1 ring-border">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Proses Berjalan · 72%
          </span>

          {docCards.map((c) => (
            <DocCard key={c.title} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}

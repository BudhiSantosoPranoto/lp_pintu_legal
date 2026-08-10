import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  Compass,
  Zap,
  ArrowRight,
  MessageCircle,
  DoorOpen,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading, Reveal } from "@/components/site/section-primitives";
import { StatsSection } from "@/components/site/animated-counter";
import { Button } from "@/components/ui/button";
import { siteConfig, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang Pintu Legal",
  description:
    "Pintu Legal hadir untuk membantu pelaku usaha mengakses legalitas bisnis yang jelas dan terarah. Kenali kisah, nilai, dan pendekatan kami.",
  alternates: { canonical: "/tentang" },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Profesional",
    desc: "Kami menangani setiap kebutuhan legalitas dengan komitmen pada ketepatan prosedur dan ketelitian dokumen.",
  },
  {
    icon: Eye,
    title: "Transparan",
    desc: "Setiap tahap dan kebutuhan dijelaskan secara terbuka, tanpa biaya tersembunyi yang membingungkan.",
  },
  {
    icon: Compass,
    title: "Terarah",
    desc: "Kami membantu Anda memilih langkah yang tepat, bukan sekadar mengurus dokumen tanpa arah.",
  },
  {
    icon: Zap,
    title: "Responsif",
    desc: "Pertanyaan dan kebutuhan Anda kami sambut dengan respons cepat melalui WhatsApp atau email.",
  },
];

const approach = [
  {
    step: "01",
    title: "Dengarkan",
    desc: "Kami mendengarkan kebutuhan, tujuan, dan konteks bisnis Anda terlebih dahulu.",
  },
  {
    step: "02",
    title: "Tentukan Solusi",
    desc: "Berdasarkan kebutuhan, kami susun langkah legalitas yang sesuai dan terarah.",
  },
  {
    step: "03",
    title: "Dampingi Hingga Selesai",
    desc: "Kami mendampingi proses hingga selesai, dengan komunikasi yang jelas di setiap tahap.",
  },
];

export default function TentangPage() {
  return (
    <SiteShell>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-alt">
        <div className="absolute inset-0 bg-grid opacity-[0.55]" aria-hidden />
        <div className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-white to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Tentang Kami
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Membantu Bisnis Tumbuh dengan Fondasi{" "}
                <span className="text-gradient-gold">Legalitas yang Tepat.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Pintu Legal percaya bahwa setiap bisnis — besar maupun kecil —
                layak mendapatkan akses legalitas yang jelas, terarah, dan
                dijangkau dengan cara yang ramah.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-navy text-white hover:bg-navy-700">
                  <Link href="/kontak">
                    Konsultasi Gratis
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-navy/20 text-navy hover:bg-navy-50"
                >
                  <a
                    href={waLink("Halo Pintu Legal, saya ingin tahu lebih banyak tentang layanan Anda.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Tanya via WhatsApp
                  </a>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Section 1: Kisah Pintu Legal ─────────────────────────── */}
      <section className="relative bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <span className="eyebrow">
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  Kisah Pintu Legal
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                  Nama &ldquo;Pintu&rdquo; kami pilih untuk satu alasan.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-soft sm:text-[1.05rem]">
                  <p>
                    Pintu Legal lahir dari keyakinan bahwa setiap bisnis layak
                    mendapatkan akses legalitas yang jelas dan terarah. Nama{" "}
                    <span className="font-semibold text-navy">&ldquo;Pintu&rdquo;</span>{" "}
                    kami pilih karena kami ingin menjadi pintu pertama yang
                    dibuka pelaku usaha saat memulai bisnis — pintu menuju
                    legalitas, pintu menuju pertumbuhan.
                  </p>
                  <p>
                    Banyak pelaku usaha merasa legalitas itu rumit, mahal, atau
                    hanya untuk perusahaan besar. Kami ingin mengubah persepsi
                    itu dengan mendampingi setiap proses secara terbuka, jelas,
                    dan sesuai kebutuhan.
                  </p>
                  <p>
                    Hingga hari ini, kami terus berkembang sebagai mitra
                    legalitas untuk pelaku usaha dari berbagai skala — dari yang
                    baru memulai, hingga yang sedang berkembang membutuhkan
                    perubahan data, perizinan, atau perlindungan kekayaan
                    intelektual.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Visual block */}
            <Reveal delay={0.12} className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl bg-navy-mesh p-8 text-white shadow-soft-lg sm:p-10">
                <div className="absolute inset-0 bg-grid-navy opacity-40" aria-hidden />
                <div className="relative">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    <DoorOpen className="h-7 w-7 text-gold" />
                  </div>
                  <p className="mt-6 text-lg font-semibold leading-snug">
                    &ldquo;Pintu pertama menuju legalitas bisnis yang lebih
                    jelas.&rdquo;
                  </p>
                  <p className="mt-3 text-sm text-white/70">
                    {siteConfig.companyName}
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      { k: "4", l: "Kategori Layanan" },
                      { k: "8+", l: "Jenis Layanan" },
                      { k: "1", l: "Pintu Menuju Legalitas" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10"
                      >
                        <p className="text-2xl font-bold text-gold">{s.k}</p>
                        <p className="mt-0.5 text-[11px] leading-tight text-white/60">
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Section 1b: Stats (factual, animated) ─────────────────── */}
      <section className="bg-white pb-8 sm:pb-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <StatsSection
              stats={[
                { value: 8, label: "Jenis Layanan", suffix: "+" },
                { value: 4, label: "Kategori Layanan" },
                { value: 3, label: "Artikel Panduan" },
                { value: 1, label: "Pintu Menuju Legalitas" },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ─── Section 2: Nilai-Nilai Kami ──────────────────────────── */}
      <section className="bg-surface-alt py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Nilai-Nilai Kami"
            title="Prinsip yang membimbing setiap layanan kami."
            description="Empat nilai sederhana yang kami pegang dalam mendampingi setiap pelaku usaha."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 0.06}>
                  <div className="group h-full rounded-2xl border border-border bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy-50 text-navy ring-1 ring-navy-100 transition-colors group-hover:bg-navy group-hover:text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-navy">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {v.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Section 3: Pendekatan Kami ───────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pendekatan Kami"
            title="Tiga langkah sederhana, hasil yang terarah."
            description="Kami tidak menyajikan proses yang berbelit. Setiap kerja sama mengikuti alur yang jelas dan dapat diikuti."
          />

          <div className="relative mt-14">
            {/* Connector line (desktop) */}
            <div
              className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
              aria-hidden
            />
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {approach.map((s, i) => (
                <Reveal key={s.step} delay={i * 0.08}>
                  <div className="relative h-full rounded-2xl border border-border bg-white p-7 shadow-soft">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-bold text-white ring-4 ring-white">
                        {s.step}
                      </span>
                      <div className="h-px flex-1 bg-border" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-navy">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {s.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: CTA band ──────────────────────────────────── */}
      <section className="bg-surface-alt pb-24 pt-4 sm:pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-navy-mesh px-6 py-14 text-center shadow-soft-lg sm:px-10 sm:py-16">
              <div className="absolute inset-0 bg-grid-navy opacity-30" aria-hidden />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Mari mulai perjalanan legalitas bisnis Anda.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                  Ceritakan kebutuhan bisnis Anda. Tim Pintu Legal akan
                  membantu menentukan langkah yang tepat.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-400">
                    <Link href="/kontak">
                      Konsultasi Gratis
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    <a
                      href={waLink("Halo Pintu Legal, saya ingin mulai konsultasi legalitas bisnis.")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}

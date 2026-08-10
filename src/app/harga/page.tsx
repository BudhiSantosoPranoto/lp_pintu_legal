import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  PhoneCall,
  ClipboardList,
  FileText,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading, Reveal } from "@/components/site/section-primitives";
import { Button } from "@/components/ui/button";
import { getServices } from "@/data/queries";
import { siteConfig, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Harga & Penawaran",
  description:
    "Setiap kebutuhan legalitas bisnis berbeda. Konsultasikan kebutuhan Anda untuk mendapatkan penawaran yang sesuai dari Pintu Legal.",
  alternates: { canonical: "/harga" },
};

const howItWorks = [
  {
    icon: PhoneCall,
    title: "Konsultasi Awal (Gratis)",
    desc: "Ceritakan kebutuhan bisnis Anda melalui form konsultasi atau WhatsApp. Kami mendengarkan tanpa biaya.",
  },
  {
    icon: ClipboardList,
    title: "Penilaian Kebutuhan",
    desc: "Tim kami menilai kebutuhan legalitas Anda, menyusun checklist, dan menjelaskan langkah yang diperlukan.",
  },
  {
    icon: FileText,
    title: "Penawaran Sesuai Kebutuhan",
    desc: "Anda menerima penawaran yang disesuaikan dengan ruang lingkup pekerjaan, transparan dan tanpa biaya tersembunyi.",
  },
];

export default async function HargaPage() {
  const services = await getServices();
  const popular = services.slice(0, 6);

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
                Penawaran
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Setiap Bisnis Unik — Begitu Juga Kebutuhan{" "}
                <span className="text-gradient-gold">Legalitasnya.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Kami tidak menampilkan harga generik karena setiap kebutuhan
                berbeda. Konsultasikan kebutuhan Anda untuk mendapatkan
                informasi layanan yang sesuai.
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
                    href={waLink("Halo Pintu Legal, saya ingin menanyakan penawaran layanan.")}
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

      {/* ─── Section: Cara Kerja Penawaran ────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Cara Kerja Penawaran Kami"
            title="Proses yang sederhana, transparan dari awal."
            description="Tiga langkah pendek untuk mendapatkan penawaran yang benar-benar sesuai kebutuhan bisnis Anda."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 0.08}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-white p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                    <div className="absolute right-5 top-5 text-5xl font-bold text-navy-50 transition-colors group-hover:text-gold-100">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-navy text-gold ring-1 ring-white/10 transition-colors group-hover:bg-gold group-hover:text-navy">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="relative mt-5 text-lg font-semibold text-navy">
                      {step.title}
                    </h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink-soft">
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Section: Paket Layanan ──────────────────────────────── */}
      <section className="bg-surface-alt py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Paket Layanan"
            title="Pilih cakupan yang sesuai dengan kebutuhan bisnis Anda."
            description="Tiga cakupan layanan untuk membantu Anda memperkirakan ruang lingkup. Harga pasti diberikan setelah konsultasi, disesuaikan dengan kompleksitas kebutuhan."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-7">
            {[
              {
                name: "Dasar",
                tagline: "Untuk UMKM yang baru memulai",
                icon: "🌱",
                features: [
                  "Konsultasi awal gratis",
                  "Pendirian badan usaha (PT/CV/Yayasan)",
                  "Pengurusan NIB & OSS",
                  "Checklist dokumen lengkap",
                  "Dukungan via WhatsApp",
                ],
                cta: "Konsultasi Kebutuhan Dasar",
                featured: false,
              },
              {
                name: "Berkembang",
                tagline: "Untuk bisnis yang sedang tumbuh",
                icon: "🚀",
                features: [
                  "Semua yang ada di paket Dasar",
                  "Perubahan data perusahaan",
                  "Pendaftaran merek / HKI",
                  "Virtual Office (jika diperlukan)",
                  "Prioritas respons",
                  "Pendampingan hingga selesai",
                ],
                cta: "Konsultasi Paket Berkembang",
                featured: true,
              },
              {
                name: "Lengkap",
                tagline: "Untuk kebutuhan legalitas menyeluruh",
                icon: "🏛️",
                features: [
                  "Semua yang ada di paket Berkembang",
                  "Perizinan berusaha khusus",
                  "Pendampingan multi-layanan",
                  "Konsultasi berkelanjutan",
                  "Koordinasi notaris & instansi",
                  "Review dokumen berkala",
                ],
                cta: "Konsultasi Paket Lengkap",
                featured: false,
              },
            ].map((pkg, i) => (
              <Reveal key={pkg.name} delay={i * 0.08}>
                <div
                  className={
                    "relative flex h-full flex-col rounded-3xl border p-7 transition-all hover:-translate-y-1 " +
                    (pkg.featured
                      ? "border-navy-700 bg-gradient-to-br from-navy to-navy-600 text-white shadow-soft-lg"
                      : "border-border bg-white text-ink shadow-soft hover:shadow-soft-lg")
                  }
                >
                  {pkg.featured && (
                    <>
                      <div className="bg-grid-navy pointer-events-none absolute inset-0 rounded-3xl opacity-30" />
                      <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-200 ring-1 ring-gold/30">
                        Populer
                      </span>
                    </>
                  )}

                  <div className="relative">
                    <span className="text-3xl" aria-hidden>{pkg.icon}</span>
                    <h3 className={"mt-3 text-xl font-bold " + (pkg.featured ? "text-white" : "text-navy")}>
                      {pkg.name}
                    </h3>
                    <p className={"mt-1 text-sm " + (pkg.featured ? "text-white/70" : "text-ink-soft")}>
                      {pkg.tagline}
                    </p>

                    <div className={"mt-5 border-t pt-5 " + (pkg.featured ? "border-white/15" : "border-border")}>
                      <p className={"text-xs font-semibold uppercase tracking-wider " + (pkg.featured ? "text-gold-200" : "text-gold-600")}>
                        Harga
                      </p>
                      <p className={"mt-1 text-2xl font-bold " + (pkg.featured ? "text-white" : "text-navy")}>
                        Konsultasi
                      </p>
                      <p className={"text-xs " + (pkg.featured ? "text-white/60" : "text-ink-soft")}>
                        Disesuaikan dengan kebutuhan
                      </p>
                    </div>

                    <ul className="mt-6 space-y-2.5">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className={"mt-0.5 h-4 w-4 shrink-0 " + (pkg.featured ? "text-gold" : "text-gold-600")} />
                          <span className={"text-sm " + (pkg.featured ? "text-white/85" : "text-ink")}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative mt-7 pt-2">
                    <Button
                      asChild
                      className={
                        "w-full " +
                        (pkg.featured
                          ? "bg-gold text-navy hover:bg-gold-400"
                          : "bg-navy text-white hover:bg-navy-700")
                      }
                    >
                      <Link href="/kontak">
                        {pkg.cta}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-ink-soft">
              Setiap paket bersifat indikatif. Cakupan dan biaya pasti ditentukan
              setelah konsultasi, berdasarkan kebutuhan, kompleksitas, dan
              ruang lingkup pekerjaan Anda.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Section: Layanan Populer ─────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Layanan Populer"
            title="Beberapa layanan yang sering dikonsultasikan."
            description="Pilih layanan yang sesuai untuk memahami ruang lingkupnya, lalu konsultasikan kebutuhan spesifik Anda bersama tim kami."
            align="left"
            className="max-w-2xl"
          />

          <Reveal delay={0.05}>
            <ul className="mt-10 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
              {popular.map((s, i) => (
                <li
                  key={s.id}
                  className={
                    "flex flex-col gap-3 p-5 transition-colors hover:bg-surface-alt sm:flex-row sm:items-center sm:justify-between sm:p-6" +
                    (i !== popular.length - 1 ? " border-b border-border" : "")
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-navy">
                        {s.name}
                      </h3>
                      {s.durationLabel && (
                        <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-medium text-navy ring-1 ring-navy-100">
                          {s.durationLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
                      {s.shortDescription}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-navy hover:bg-navy-50 hover:text-navy"
                    >
                      <Link href={`/layanan/${s.slug}`}>
                        Detail
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="bg-navy text-white hover:bg-navy-700"
                    >
                      <Link href="/kontak">Konsultasi</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-6 flex justify-center sm:justify-start">
              <Button asChild variant="outline" className="border-navy/20 text-navy hover:bg-navy-50">
                <Link href="/layanan">
                  Lihat semua layanan
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Section: Big CTA card ────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-navy-mesh px-6 py-14 shadow-soft-lg sm:px-10 sm:py-16 lg:px-14">
              <div className="absolute inset-0 bg-grid-navy opacity-30" aria-hidden />
              <div className="relative grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Diskusikan Kebutuhan Saya
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                    Tidak yakin layanan mana yang sesuai? Tim kami siap
                    mendengarkan kebutuhan bisnis Anda dan membantu menentukan
                    langkah yang tepat — tanpa biaya konsultasi awal.
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {[
                      "Konsultasi awal gratis",
                      "Penawaran transparan sesuai kebutuhan",
                      "Pendampingan hingga selesai",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                        <CheckCircle2 className="h-4 w-4 text-gold" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:justify-self-end">
                  <div className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-7 lg:w-[360px]">
                    <p className="text-sm font-medium text-white">
                      Mulai konsultasi
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      Pilih saluran yang paling nyaman untuk Anda.
                    </p>
                    <div className="mt-5 space-y-3">
                      <Button asChild size="lg" className="w-full bg-gold text-navy hover:bg-gold-400">
                        <Link href="/kontak">
                          Isi Form Konsultasi
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                      >
                        <a
                          href={waLink("Halo Pintu Legal, saya ingin mendiskusikan kebutuhan legalitas bisnis saya.")}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Chat WhatsApp
                        </a>
                      </Button>
                    </div>
                    <p className="mt-4 text-center text-[11px] text-white/50">
                      Atau hubungi: {siteConfig.whatsappDisplay}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}

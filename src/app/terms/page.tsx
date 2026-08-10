import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ScrollText, AlertCircle } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/site/section-primitives";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Syarat dan ketentuan penggunaan situs serta layanan Pintu Legal (PT. Pintu Menuju Sukses).",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    id: "penerimaan",
    title: "1. Penerimaan Ketentuan",
    body: [
      "Dengan mengakses dan menggunakan situs web Pintu Legal, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.",
      "Apabila Anda tidak menyetujui sebagian atau seluruh ketentuan ini, mohon untuk tidak menggunakan layanan kami.",
    ],
  },
  {
    id: "layanan",
    title: "2. Layanan Kami",
    body: [
      "Pintu Legal menyediakan layanan pendampingan legalitas bisnis, termasuk namun tidak terbatas pada pendirian badan usaha, perubahan data perusahaan, perizinan, HKI, dan layanan pendukung lainnya.",
      "Lingkup pekerjaan setiap layanan akan disepakati secara tertulis antara Anda dan Pintu Legal sebelum pekerjaan dimulai.",
    ],
  },
  {
    id: "kewajiban",
    title: "3. Kewajiban Pengguna",
    body: [
      "Anda setuju untuk: (a) memberikan informasi yang benar dan lengkap; (b) menyediakan dokumen yang diperlukan; (c) membayar biaya layanan sesuai kesepakatan; serta (d) mematuhi peraturan perundang-undangan yang berlaku.",
      "Pintu Legal tidak bertanggung jawab atas keterlambatan atau kegagalan proses yang disebabkan oleh ketidaklengkapan atau ketidakakuratan data dari pihak Anda.",
    ],
  },
  {
    id: "pembayaran",
    title: "4. Pembayaran",
    body: [
      "Biaya layanan akan disampaikan setelah konsultasi awal dan penilaian kebutuhan. Ketentuan pembayaran (termin, metode, dan tenggat) akan dijelaskan dalam penawaran.",
      "Template ini akan diperbarui dengan kebijakan pembayaran yang lebih rinci sesuai kebutuhan operasional PT. Pintu Menuju Sukses.",
    ],
  },
  {
    id: "haki",
    title: "5. Hak Kekayaan Intelektual",
    body: [
      "Seluruh konten pada situs ini — termasuk logo, teks, grafik, dan tata letak — merupakan milik PT. Pintu Menuju Sukses dan dilindungi oleh peraturan perundang-undangan hak kekayaan intelektual.",
      "Anda dilarang menyalin, mendistribusikan, atau menggunakan konten situs ini untuk tujuan komersial tanpa izin tertulis dari kami.",
    ],
  },
  {
    id: "tanggung-jawab",
    title: "6. Batasan Tanggung Jawab",
    body: [
      "Layanan kami bersifat pendampingan administratif dan legalitas. Hasil akhir setiap proses (misalnya persetujuan instansi) tetap berada dalam kewenangan instansi terkait.",
      "Pintu Legal tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan, sejauh diizinkan oleh peraturan yang berlaku.",
    ],
  },
  {
    id: "perubahan-layanan",
    title: "7. Perubahan Layanan",
    body: [
      "Kami dapat mengubah, menambah, atau menghentikan layanan tertentu dari waktu ke waktu. Perubahan signifikan akan dikomunikasikan melalui kanal yang tersedia.",
    ],
  },
  {
    id: "hukum",
    title: "8. Hukum yang Berlaku",
    body: [
      "Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Republik Indonesia.",
      "Setiap perselisihan akan diupayakan diselesaikan secara musyawarah, dan apabila tidak tercapai, akan diselesaikan melalui mekanisme hukum yang berlaku.",
    ],
  },
  {
    id: "kontak",
    title: "9. Kontak",
    body: [
      `Untuk pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi kami melalui email ${siteConfig.email} atau WhatsApp ${siteConfig.whatsappDisplay}.`,
    ],
  },
];

const lastUpdated = "Terakhir diperbarui: 1 Januari 2026";

export default function TermsPage() {
  return (
    <SiteShell>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-alt">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-white to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <Reveal>
            <span className="eyebrow">
              <span className="h-1 w-1 rounded-full bg-gold" />
              Legal
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 flex items-center gap-3 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              <ScrollText className="h-9 w-9 text-gold" />
              Terms &amp; Conditions
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-sm text-ink-soft">{lastUpdated}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-ink-soft">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              <span>
                Dokumen ini adalah template dan dapat diperbarui sesuai
                kebutuhan PT. Pintu Menuju Sukses.
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Body ──────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <article>
              {/* TOC */}
              <nav
                aria-label="Daftar isi"
                className="mb-10 rounded-2xl border border-border bg-surface-alt p-5 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                  Daftar Isi
                </p>
                <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-ink-soft transition-colors hover:text-navy"
                      >
                        <span className="text-ink-soft/60">{i + 1}.</span>{" "}
                        {s.title.replace(/^\d+\.\s*/, "")}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              {/* Sections */}
              <div className="space-y-10">
                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="scroll-mt-24">
                    <h2 className="text-xl font-semibold text-navy sm:text-2xl">
                      {s.title}
                    </h2>
                    <div className="mt-3 space-y-3">
                      {s.body.map((p, i) => (
                        <p
                          key={i}
                          className="text-[15px] leading-relaxed text-ink-soft"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-12 border-t border-border pt-6">
                <Button asChild variant="outline" className="border-navy/20 text-navy hover:bg-navy-50">
                  <Link href="/">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Kembali ke beranda
                  </Link>
                </Button>
              </div>
            </article>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}

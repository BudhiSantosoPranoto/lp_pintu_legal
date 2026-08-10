import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/site/section-primitives";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Kebijakan privasi Pintu Legal (PT. Pintu Menuju Sukses) mengenai pengumpulan, penggunaan, dan perlindungan data pribadi Anda.",
  alternates: { canonical: "/privacy-policy" },
};

const sections = [
  {
    id: "pendahuluan",
    title: "1. Pendahuluan",
    body: [
      "Kebijakan Privasi ini menjelaskan bagaimana PT. Pintu Menuju Sukses (\u201CPintu Legal\u201D) mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan situs web dan layanan kami.",
      "Dengan mengakses situs ini atau mengirimkan informasi melalui form konsultasi, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.",
    ],
  },
  {
    id: "informasi",
    title: "2. Informasi yang Kami Kumpulkan",
    body: [
      "Kami mengumpulkan informasi yang Anda berikan secara sukarela melalui form konsultasi, WhatsApp, atau email, antara lain: nama, nomor WhatsApp, email (opsional), nama usaha, jenis layanan yang diminati, dan pesan yang Anda kirimkan.",
      "Selain itu, kami dapat mengumpulkan informasi teknis tertentu (seperti alamat IP dan jenis peramban) untuk keperluan keamanan dan analitik.",
    ],
  },
  {
    id: "penggunaan",
    title: "3. Penggunaan Informasi",
    body: [
      "Informasi yang kami kumpulkan digunakan untuk: (a) merespons permintaan konsultasi Anda; (b) memberikan layanan legalitas yang sesuai; (c) mengirimkan informasi terkait proses layanan; serta (d) meningkatkan kualitas layanan kami.",
      "Kami tidak akan menggunakan data pribadi Anda untuk tujuan pemasaran tanpa persetujuan terlebih dahulu.",
    ],
  },
  {
    id: "pembagian",
    title: "4. Pembagian Informasi",
    body: [
      "Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga.",
      "Pembagian informasi hanya dilakukan apabila diperlukan untuk melaksanakan layanan (misalnya kepada notaris atau instansi terkait atas persetujuan Anda), atau apabila diwajibkan oleh peraturan perundang-undangan yang berlaku.",
    ],
  },
  {
    id: "keamanan",
    title: "5. Keamanan Data",
    body: [
      "Kami menerapkan langkah-langkah teknis dan organisasi yang wajar untuk melindungi data pribadi Anda dari akses, pengungkapan, perubahan, atau penghancuran yang tidak sah.",
      "Meskipun demikian, tidak ada metode transmisi melalui internet yang sepenuhnya aman, sehingga kami tidak dapat menjamin keamanan absolut.",
    ],
  },
  {
    id: "hak",
    title: "6. Hak Anda",
    body: [
      "Anda memiliki hak untuk mengakses, memperbarui, atau meminta penghapusan data pribadi yang telah Anda berikan kepada kami.",
      "Untuk menggunakan hak ini, silakan hubungi kami melalui kontak yang tersedia di bagian bawah halaman ini.",
    ],
  },
  {
    id: "perubahan",
    title: "7. Perubahan Kebijakan",
    body: [
      "Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu sesuai kebutuhan operasional atau peraturan yang berlaku. Perubahan akan dipublikasikan pada halaman ini dengan tanggal pembaruan terbaru.",
    ],
  },
  {
    id: "kontak",
    title: "8. Kontak",
    body: [
      `Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami melalui email ${siteConfig.email} atau WhatsApp ${siteConfig.whatsappDisplay}.`,
    ],
  },
];

const lastUpdated = "Terakhir diperbarui: 1 Januari 2026";

export default function PrivacyPolicyPage() {
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
              <FileText className="h-9 w-9 text-gold" />
              Privacy Policy
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

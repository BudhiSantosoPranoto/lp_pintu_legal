import type { Metadata } from "next";
import {
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ShieldCheck,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/site/section-primitives";
import { ContactValue } from "@/components/site/contact-value";
import { ConsultationFormWrapper } from "@/components/sections/consultation-form-wrapper";
import { getServices } from "@/data/queries";
import { siteConfig, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Konsultasi Gratis",
  description:
    "Ceritakan kebutuhan legalitas bisnis Anda. Tim Pintu Legal akan menghubungi Anda melalui WhatsApp atau email untuk konsultasi gratis.",
  alternates: { canonical: "/kontak" },
};

const socials = [
  { key: "Instagram", href: siteConfig.socials.instagram, Icon: Instagram },
  { key: "Facebook", href: siteConfig.socials.facebook, Icon: Facebook },
  { key: "LinkedIn", href: siteConfig.socials.linkedin, Icon: Linkedin },
  { key: "YouTube", href: siteConfig.socials.youtube, Icon: Youtube },
].filter((s) => s.href);

export default async function KontakPage() {
  const services = await getServices();
  const serviceOptions = services.map((s) => ({ id: s.id, name: s.name }));

  return (
    <SiteShell>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-alt">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-white to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Kontak
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Konsultasi Gratis
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Ceritakan kebutuhan bisnis Anda. Tim Pintu Legal akan
                menghubungi Anda melalui WhatsApp atau email.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Two-column body ──────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* LEFT: contact info card */}
            <div className="lg:col-span-5">
              <Reveal>
                <div className="relative h-full overflow-hidden rounded-3xl bg-navy-mesh p-7 text-white shadow-soft-lg sm:p-8 lg:p-9">
                  <div className="absolute inset-0 bg-grid-navy opacity-25" aria-hidden />
                  <div className="relative flex h-full flex-col">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Mari berbicara.
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                      Pilih saluran yang paling nyaman untuk Anda. Kami akan
                      merespons secepat mungkin pada jam kerja.
                    </p>

                    <ul className="mt-8 space-y-5">
                      {/* WhatsApp */}
                      <li>
                        <a
                          href={waLink("Halo Pintu Legal, saya ingin berkonsultasi.")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-4"
                        >
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-gold ring-1 ring-white/10 transition-colors group-hover:bg-gold/15 group-hover:ring-gold/30">
                            <MessageCircle className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-[11px] font-medium uppercase tracking-wider text-white/50">
                              WhatsApp
                            </span>
                            <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-xs italic text-white/40 ring-1 ring-dashed ring-white/15">
                              <ContactValue value={siteConfig.whatsappDisplay} />
                            </span>
                          </span>
                        </a>
                      </li>

                      {/* Email */}
                      <li>
                        <a
                          href={`mailto:${siteConfig.email}`}
                          className="group flex items-start gap-4"
                        >
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-gold ring-1 ring-white/10 transition-colors group-hover:bg-gold/15 group-hover:ring-gold/30">
                            <Mail className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[11px] font-medium uppercase tracking-wider text-white/50">
                              Email
                            </span>
                            <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-xs italic text-white/40 ring-1 ring-dashed ring-white/15">
                              <ContactValue value={siteConfig.email} />
                            </span>
                          </span>
                        </a>
                      </li>

                      {/* Address */}
                      <li className="flex items-start gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-gold ring-1 ring-white/10">
                          <MapPin className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-[11px] font-medium uppercase tracking-wider text-white/50">
                            Alamat
                          </span>
                          <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-xs italic text-white/40 ring-1 ring-dashed ring-white/15">
                            <ContactValue value={siteConfig.address} />
                          </span>
                        </span>
                      </li>

                      {/* Business hours */}
                      <li className="flex items-start gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-gold ring-1 ring-white/10">
                          <Clock className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-[11px] font-medium uppercase tracking-wider text-white/50">
                            Jam Operasional
                          </span>
                          <span className="block text-sm font-medium text-white">
                            Senin – Jumat, 09.00 – 17.00 WIB
                          </span>
                          <span className="mt-0.5 block text-xs text-white/55">
                            Sabtu, 09.00 – 13.00 WIB
                          </span>
                        </span>
                      </li>
                    </ul>

                    {/* Socials */}
                    {socials.length > 0 && (
                      <div className="mt-8">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                          Ikuti kami
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {socials.map(({ key, href, Icon }) => (
                            <a
                              key={key}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={key}
                              className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-gold/15 hover:text-gold hover:ring-gold/30"
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-8">
                      <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.04] p-3.5 text-xs text-white/70 ring-1 ring-white/10">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" />
                        <span>
                          Data Anda diperlakukan secara konfidensial dan hanya
                          digunakan untuk keperluan konsultasi.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* RIGHT: form with A/B variant toggle */}
            <div className="lg:col-span-7">
              <Reveal delay={0.05}>
                <div className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8 lg:p-9">
                  <ConsultationFormWrapper services={serviceOptions} />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

import Link from "next/link";
import {
  MessageCircle,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { siteConfig, waLink } from "@/lib/site";
import { Logo } from "./logo";
import { ContactValue } from "@/components/site/contact-value";

const company = [
  { label: "Tentang Kami", href: "/tentang" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "Kontak", href: "/kontak" },
];

const legal = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socials = [
  { key: "Instagram", href: siteConfig.socials.instagram, Icon: Instagram },
  { key: "Facebook", href: siteConfig.socials.facebook, Icon: Facebook },
  { key: "LinkedIn", href: siteConfig.socials.linkedin, Icon: Linkedin },
  { key: "YouTube", href: siteConfig.socials.youtube, Icon: Youtube },
].filter((s) => s.href);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10">
              <Logo inverted />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                {siteConfig.tagline} Pintu Legal hadir untuk membuat proses
                legalitas bisnis menjadi lebih jelas dan terarah.
              </p>
              <p className="mt-3 text-xs text-white/50">
                {siteConfig.companyName}
              </p>
            </div>

            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={waLink("Halo Pintu Legal, saya ingin berkonsultasi.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-white/80 hover:text-gold"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 group-hover:bg-gold/15 group-hover:ring-gold/30">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] uppercase tracking-wider text-white/40">WhatsApp</span>
                  <ContactValue value={siteConfig.whatsappDisplay} />
                </span>
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="group flex items-center gap-3 text-white/80 hover:text-gold"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 group-hover:bg-gold/15 group-hover:ring-gold/30">
                  <Mail className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] uppercase tracking-wider text-white/40">Email</span>
                  <ContactValue value={siteConfig.email} />
                </span>
              </a>
              <div className="group flex items-center gap-3 text-white/80">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] uppercase tracking-wider text-white/40">Alamat</span>
                  <ContactValue value={siteConfig.address} />
                </span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/90">Layanan</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {siteConfig.footerServices.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="text-white/70 transition-colors hover:text-white"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/90">Perusahaan</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {company.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="text-white/70 transition-colors hover:text-white"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/90">Legal</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {legal.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="text-white/70 transition-colors hover:text-white"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA + socials */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent p-5 ring-1 ring-white/10">
              <p className="text-sm font-medium text-white">Butuh konsultasi?</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                Tim kami siap mendampingi kebutuhan legalitas bisnis Anda.
              </p>
              <Link
                href="/kontak"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-400"
              >
                Konsultasi Gratis
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              {socials.length > 0 && (
                <div className="mt-5 flex items-center gap-2">
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
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
              <ShieldCheck className="h-4 w-4 text-gold/80" />
              <span>Data Anda diperlakukan secara konfidensial.</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {year} {siteConfig.companyName}. All rights reserved.</p>
          <p>
            Dibuat dengan komitmen pada legalitas bisnis yang lebih terarah.
          </p>
        </div>
      </div>
    </footer>
  );
}

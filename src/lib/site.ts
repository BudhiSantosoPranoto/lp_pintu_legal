/**
 * PINTU LEGAL — Central site configuration.
 * PT. Pintu Menuju Sukses
 *
 * NOTE: Per master prompt, we MUST NOT invent business contact data.
 * All values are placeholders that are easy to replace via env vars or
 * the /admin site-settings panel.
 */

export const siteConfig = {
  brandName: process.env.NEXT_PUBLIC_SITE_NAME ?? "PINTU LEGAL",
  companyName: "PT. Pintu Menuju Sukses",
  tagline: "Membuka Jalan Menuju Bisnis yang Legal.",
  description:
    "Pintu Legal membantu mengurus kebutuhan legalitas bisnis Anda secara profesional, jelas, dan terarah — mulai dari pendirian badan usaha, perizinan, hingga HKI.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pintulegal.id",

  // Contact
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6285888818055", // E.164 without "+"
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? "0858-8881-8055",
  email: process.env.NEXT_PUBLIC_SITE_EMAIL ?? "[Email]",
  address: process.env.NEXT_PUBLIC_SITE_ADDRESS ?? "[Alamat]",

  socials: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? "",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN ?? "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE ?? "",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Layanan", href: "/layanan" },
    { label: "Harga", href: "/harga" },
    { label: "Tentang Kami", href: "/tentang" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/blog" },
  ] as const,

  footerServices: [
    { label: "Pendirian PT", href: "/layanan/pendirian-pt" },
    { label: "Pendirian CV", href: "/layanan/pendirian-cv" },
    { label: "Pendirian Yayasan", href: "/layanan/pendirian-yayasan" },
    { label: "Perubahan Data Perusahaan", href: "/layanan/perubahan-data-perusahaan" },
    { label: "Pendaftaran Merek / HKI", href: "/layanan/pendaftaran-merek-hki" },
    { label: "NIB & OSS", href: "/layanan/nib-oss" },
    { label: "Virtual Office", href: "/layanan/virtual-office" },
    { label: "Layanan Lainnya", href: "/layanan" },
  ] as const,
} as const;

export type SiteConfig = typeof siteConfig;

/** Build a wa.me URL with a prefilled message. */
export function waLink(message?: string) {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

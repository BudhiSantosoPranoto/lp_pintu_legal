# Pintu Legal — Website Legalitas Bisnis

> **Membuka Jalan Menuju Bisnis yang Legal.**
>
 Website premium, modern, dan production-ready untuk **Pintu Legal** (PT. Pintu Menuju Sukses) — perusahaan jasa legalitas dan pendirian badan usaha di Indonesia.

---

## ✨ Fitur Utama

- **Homepage premium** dengan hero animasi (floating legal document cards), trust bar, layanan bento grid, "Kenapa Pintu Legal", "Bagaimana Prosesnya", pricing CTA, FAQ, dan final CTA.
- **Halaman layanan** `/layanan` + detail `/layanan/[slug]` untuk 8 layanan (Pendirian PT/CV/Yayasan, Perubahan Data, HKI, NIB & OSS, Virtual Office, Layanan Lainnya).
- **Blog** `/blog` + `/blog/[slug]` dengan 3 artikel seed untuk SEO.
- **Halaman perusahaan**: `/tentang`, `/harga`, `/faq`, `/kontak` (dengan form konsultasi + validasi + honeypot + rate limiting), `/privacy-policy`, `/terms`.
- **Admin panel** `/admin` dengan login aman (bcrypt + HMAC-signed cookie): dashboard, manajemen leads, services, blog, FAQ, testimonials, dan site settings.
- **Floating WhatsApp button** dengan expandable chat card.
- **SEO lengkap**: sitemap.xml dinamis, robots.txt, Open Graph, Twitter Card, structured data (Organization, Service, FAQPage, Article, BreadcrumbList), favicon SVG, OG image SVG.
- **Responsive** mobile-first, aksesibilitas (semantic HTML, ARIA, keyboard nav, prefers-reduced-motion).
- **Performance**: Next.js 16 Turbopack, server components, code splitting, optimized fonts.

## 🎨 Brand Identity

| Token | Warna | Penggunaan |
|-------|-------|------------|
| Navy | `#0F2747` | Heading, navbar, CTA, footer, section navy |
| Gold | `#C89B3C` | Accent, highlight, tombol CTA gold |
| Background | `#FFFFFF` | Background utama |
| Surface Alt | `#F7F8FA` | Background section sekunder |
| Ink | `#0F172A` | Text utama |
| Ink Soft | `#64748B` | Text sekunder |
| Border | `#E2E8F0` | Border |

**Logo**: pintu navy dua daun dengan handle gold, wordmark "PINTU" (navy) + "LEGAL" (gold). Tersedia di `public/logo.svg` dan `public/favicon.svg`.

**Font**: Plus Jakarta Sans (heading + body).

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict)
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **ORM**: Prisma 6
- **Database**: SQLite (dev sandbox) → MySQL (production)
- **Forms**: React Hook Form + Zod
- **Auth**: bcryptjs + Web Crypto HMAC (cookie-based, no NextAuth overhead)

## 📦 Instalasi

### Prasyarat
- Node.js 18+ atau Bun 1.1+
- MySQL 8+ (production) atau SQLite (dev)

### Langkah

```bash
# 1. Clone & install
git clone <repo-url> pintu-legal
cd pintu-legal
bun install   # atau npm install

# 2. Salin environment variables
cp .env.example .env
# Edit .env — isi DATABASE_URL, NEXT_PUBLIC_WHATSAPP_NUMBER, dll.

# 3. Setup database
bun run db:push      # buat tabel dari schema Prisma
bun run db:seed      # isi data seed (services, FAQs, blog posts, site settings)

# 4. (Opsional) Buat admin user
bun run scripts/create-admin.ts admin@pintulegal.id "password-anda"

# 5. Jalankan dev server
bun run dev
```

Buka `http://localhost:3000`.

## 🔐 Environment Variables

Lihat `.env.example` untuk daftar lengkap. Yang wajib:

```env
DATABASE_URL="file:./db/custom.db"          # SQLite (dev) atau mysql://... (prod)
NEXT_PUBLIC_SITE_URL="https://pintulegal.id"
NEXT_PUBLIC_WHATSAPP_NUMBER="6200000000000"  # E.164 tanpa "+"
AUTH_SECRET="random-32-char-string"          # Untuk signing admin cookie
```

## 🗄 Database

Schema Prisma ada di `prisma/schema.prisma`. Models:

- `User` — admin users
- `Service` + `ServiceCategory` — layanan legalitas
- `Lead` — form konsultasi submissions
- `BlogPost` + `BlogCategory` — artikel blog
- `Faq` — FAQ
- `Testimonial` — testimonial
- `SiteSetting` — konfigurasi key/value

### Perintah database

```bash
bun run db:push      # sync schema ke DB
bun run db:generate  # regenerate Prisma Client
bun run db:seed      # jalankan seed
bun run db:migrate   # buat & jalankan migration (MySQL)
bun run db:reset     # reset DB (dev only)
```

### Migrasi ke MySQL (production)

1. Ubah `prisma/schema.prisma`: `provider = "mysql"`
2. Set `DATABASE_URL="mysql://user:pass@host:3306/pintu_legal"`
3. Jalankan `bun run db:migrate dev --name init`
4. Jalankan `bun run db:seed`

## 👨‍💼 Admin Panel

Akses di `/admin/login`. Untuk membuat admin:

```bash
bun run scripts/create-admin.ts <email> <password>
```

Atau, set `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` di `.env` untuk auth tanpa DB lookup (generate hash dengan `bun run scripts/hash-admin.ts <password>`).

**Fitur admin**:
- Dashboard: statistik leads, services, blog posts
- Leads: list, filter status, update status, hapus
- Services: CRUD lengkap
- Blog: CRUD + toggle DRAFT/PUBLISHED
- FAQ: CRUD
- Testimonials: CRUD
- Site Settings: edit key/value

## 🚀 Deployment (Vercel)

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables di Vercel dashboard
4. Untuk MySQL: gunakan Vercel Postgres (jika kompatibel) atau external MySQL (PlanetScale, Railway, dll.)
5. Deploy

```bash
# Build lokal untuk test
bun run build
bun run start
```

## 📁 Struktur Project

```
src/
├── app/
│   ├── (public)/          # halaman publik
│   ├── admin/             # admin panel
│   ├── api/               # API routes
│   ├── layout.tsx         # root layout (font, metadata)
│   ├── page.tsx           # homepage
│   ├── sitemap.ts         # dynamic sitemap
│   └── robots.ts          # dynamic robots
├── components/
│   ├── layout/            # Navbar, Footer, WhatsApp, SiteShell
│   ├── sections/          # Homepage sections + consultation form
│   ├── site/              # Reusable site components (Reveal, ServiceIcon, dll)
│   └── ui/                # shadcn/ui components
├── data/                  # Server-side DB queries
├── lib/
│   ├── auth/              # Admin auth (bcrypt + HMAC cookie)
│   ├── db.ts              # Prisma client
│   ├── seo.ts             # JSON-LD structured data
│   ├── site.ts            # Site config (brand, nav, contacts)
│   └── utils.ts           # cn() utility
└── hooks/                 # React hooks

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed data

scripts/
└── create-admin.ts        # Bootstrap admin user

public/
├── logo.svg               # Logo PINTU LEGAL
├── favicon.svg            # Favicon (door icon)
└── og-image.svg           # Open Graph image
```

## 📝 Catatan

- **Tidak ada data palsu**: tidak ada angka customer fiktif, testimonial palsu, atau harga mengarang. Semua placeholder (WhatsApp, email, alamat) ditandai jelas dan mudah diganti via `.env` atau admin settings.
- **Phase 1 scope**: website marketing + lead gen + admin sederhana. Tidak ada customer portal, payment, atau AI assistant (di-future-proof via modular architecture).
- **Aksesibilitas**: semantic HTML, ARIA labels, keyboard navigation, `prefers-reduced-motion` dihormati.

## 📄 License

© 2026 PT. Pintu Menuju Sukses. All rights reserved.

/**
 * Seed script for PINTU LEGAL.
 * Run with: `bun run prisma:seed` (or `bunx tsx prisma/seed.ts`)
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function json(value: unknown) {
  return JSON.stringify(value);
}

async function main() {
  console.log("→ Seeding PINTU LEGAL database…");

  // ── Site settings ─────────────────────────────────────────────────────
  const settings: Record<string, string> = {
    brand_name: "PINTU LEGAL",
    company_name: "PT. Pintu Menuju Sukses",
    tagline: "Membuka Jalan Menuju Bisnis yang Legal.",
    whatsapp_number: "6200000000000",
    email: "[Email]",
    address: "[Alamat]",
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    site_url: "https://pintulegal.id",
    primary_color: "#0F2747",
    secondary_color: "#C89B3C",
  };

  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ── Service categories ───────────────────────────────────────────────
  const pendirian = await db.serviceCategory.upsert({
    where: { slug: "pendirian-badan-usaha" },
    update: {},
    create: {
      name: "Pendirian Badan Usaha",
      slug: "pendirian-badan-usaha",
      description: "Pendirian PT, CV, dan Yayasan.",
      sortOrder: 1,
    },
  });

  const perubahan = await db.serviceCategory.upsert({
    where: { slug: "perubahan-perizinan" },
    update: {},
    create: {
      name: "Perubahan & Perizinan",
      slug: "perubahan-perizinan",
      description: "Perubahan data perusahaan, NIB & OSS, serta perizinan.",
      sortOrder: 2,
    },
  });

  const hki = await db.serviceCategory.upsert({
    where: { slug: "hki-kekayaan-intelektual" },
    update: {},
    create: {
      name: "HKI & Kekayaan Intelektual",
      slug: "hki-kekayaan-intelektual",
      description: "Pendaftaran merek dan hak kekayaan intelektual.",
      sortOrder: 3,
    },
  });

  const pendukung = await db.serviceCategory.upsert({
    where: { slug: "layanan-pendukung" },
    update: {},
    create: {
      name: "Layanan Pendukung",
      slug: "layanan-pendukung",
      description: "Virtual office dan layanan legalitas lainnya.",
      sortOrder: 4,
    },
  });

  // ── Services ──────────────────────────────────────────────────────────
  const services = [
    {
      slug: "pendirian-pt",
      name: "Pendirian PT",
      shortDescription:
        "Mendampingi pendirian Perseroan Terbatas (PT) sesuai ketentuan UU PT, mulai dari akta hingga SK Kemenkumham.",
      description:
        "Pendirian PT adalah langkah penting untuk memberikan badan hukum pada bisnis Anda. Pintu Legal membantu menyusun dokumen, mengurus akta di notaris, hingga perolehan SK Kemenkumham dan NIB. Kami mendampingi setiap tahap agar proses berjalan jelas dan terarah.",
      icon: "Building2",
      highlights: json([
        "Konsultasi struktur & kebutuhan PT",
        "Pendampingan akta pendirian di notaris",
        "Pengurusan SK Kemenkumham",
        "Pendaftaran NIB melalui OSS",
        "Checklist dokumen lengkap",
      ]),
      processSteps: json([
        "Konsultasi awal & penentuan struktur PT",
        "Penyiapan dokumen & persyaratan",
        "Pembuatan akta pendirian di notaris",
        "Pengajuan SK Kemenkumham",
        "Penerbitan NIB melalui OSS",
      ]),
      requirements: json([
        "KTP para pendiri",
        "NPWP para pendiri",
        "Pass foto direksi",
        "Pernyataan alamat kantor",
      ]),
      durationLabel: "Estimasi 14–21 hari kerja",
      categoryId: pendirian.id,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: "pendirian-cv",
      name: "Pendirian CV",
      shortDescription:
        "Pendirian Commanditaire Vennootschap (CV) untuk usaha yang membutuhkan bentuk badan usaha sederhana.",
      description:
        "CV adalah bentuk badan usaha yang umum dipilih usaha menengah. Pintu Legal membantu dari penyusunan akta, pengurusan SK, hingga NIB, sehingga CV Anda berdiri dengan fondasi yang jelas.",
      icon: "Briefcase",
      highlights: json([
        "Konsultasi struktur CV",
        "Pendampingan akta pendirian",
        "Pengurusan SK Kemenkumham",
        "Pendaftaran NIB",
      ]),
      processSteps: json([
        "Konsultasi & penentukan struktur",
        "Penyiapan dokumen",
        "Pembuatan akta di notaris",
        "Pengajuan SK Kemenkumham",
        "Penerbitan NIB",
      ]),
      requirements: json(["KTP pendiri", "NPWP pendiri", "Alamat kantor"]),
      durationLabel: "Estimasi 10–14 hari kerja",
      categoryId: pendirian.id,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      slug: "pendirian-yayasan",
      name: "Pendirian Yayasan",
      shortDescription:
        "Mendampingi pendirian yayasan untuk kegiatan sosial, keagamaan, atau nirlaba sesuai UU Yayasan.",
      description:
        "Yayasan merupakan badan hukum untuk tujuan sosial, keagamaan, dan kemanusiaan. Pintu Legal membantu menyusun akta, pengesahan Kemenkumham, hingga NIB yayasan Anda.",
      icon: "HeartHandshake",
      highlights: json([
        "Konsultasi tujuan & struktur yayasan",
        "Pendampingan akta pendirian",
        "Pengesahan Kemenkumham",
        "Pendaftaran NIB",
      ]),
      processSteps: json([
        "Konsultasi tujuan yayasan",
        "Penyiapan dokumen",
        "Akta pendirian",
        "Pengesahan Kemenkumham",
        "Penerbitan NIB",
      ]),
      requirements: json([
        "KTP para pembina/pengurus",
        "NPWP para pembina/pengurus",
        "Alamat kantor yayasan",
      ]),
      durationLabel: "Estimasi 14–21 hari kerja",
      categoryId: pendirian.id,
      isFeatured: false,
      sortOrder: 3,
    },
    {
      slug: "perubahan-data-perusahaan",
      name: "Perubahan Data Perusahaan",
      shortDescription:
        "Mengurus perubahan struktur, alamat, atau kepengurusan PT/CV/Yayasan sesuai ketentuan.",
      description:
        "Perubahan data perusahaan — seperti alamat, direksi, atau modal — perlu disahkan agar dokumen tetap valid. Pintu Legal membantu menyusun akta perubahan dan mengurus pengesahan.",
      icon: "FileEdit",
      highlights: json([
        "Konsultasi jenis perubahan",
        "Penyiapan akta perubahan",
        "Pengesahan Kemenkumham",
        "Pemutakhiran NIB/OSS",
      ]),
      processSteps: json([
        "Identifikasi perubahan",
        "Penyiapan dokumen",
        "Akta perubahan di notaris",
        "Pengesahan & pelaporan OSS",
      ]),
      requirements: json([
        "Akta pendirian & perubahan sebelumnya",
        "KTP direksi/pengurus",
        "Dokumen pendukung perubahan",
      ]),
      durationLabel: "Estimasi 7–14 hari kerja",
      categoryId: perubahan.id,
      isFeatured: true,
      sortOrder: 4,
    },
    {
      slug: "pendaftaran-merek-hki",
      name: "Pendaftaran Merek / HKI",
      shortDescription:
        "Membantu pendaftaran merek, hak cipta, dan paten melalui Direktorat Jenderal Kekayaan Intelektual.",
      description:
        "Perlindungan merek dan karya intelektual penting untuk bisnis jangka panjang. Pintu Legal membantu proses pengajuan merek, hak cipta, dan paten agar aset intelektual Anda terdaftar dengan benar.",
      icon: "BadgeCheck",
      highlights: json([
        "Pencarian kemiripan merek",
        "Penyusunan dokumen pengajuan",
        "Pengajuan ke DJKI",
        "Monitoring status pendaftaran",
      ]),
      processSteps: json([
        "Konsultasi kelas merek/HKI",
        "Pencarian kemiripan",
        "Penyiapan dokumen",
        "Pengajuan ke DJKI",
        "Monitoring status",
      ]),
      requirements: json([
        "Logo/merek (format file)",
        "KTP pemohon",
        "Surat kuasa (jika perwakilan)",
      ]),
      durationLabel: "Estimasi 6–18 bulan (proses DJKI)",
      categoryId: hki.id,
      isFeatured: true,
      sortOrder: 5,
    },
    {
      slug: "nib-oss",
      name: "NIB & OSS",
      shortDescription:
        "Pendaftaran Nomor Induk Berusaha (NIB) dan perizinan berusaha berbasis risiko melalui OSS.",
      description:
        "NIB adalah identitas pelaku usaha yang berlaku sebagai angka pengenal dan hak akses perizinan. Pintu Legal membantu pendaftaran OSS dan perizinan berusaha sesuai klasifikasi risiko usaha Anda.",
      icon: "FileCheck2",
      highlights: json([
        "Pendaftaran akun OSS",
        "Pengisian data usaha",
        "Penerbitan NIB",
        "Pendampingan perizinan berusaha",
      ]),
      processSteps: json([
        "Konsultasi klasifikasi usaha",
        "Pendaftaran akun OSS",
        "Pengisian data & dokumen",
        "Penerbitan NIB & perizinan",
      ]),
      requirements: json([
        "KTP pemilik/pengurus",
        "NPWP",
        "Dokumen badan usaha (jika sudah ada)",
      ]),
      durationLabel: "Estimasi 1–5 hari kerja",
      categoryId: perubahan.id,
      isFeatured: false,
      sortOrder: 6,
    },
    {
      slug: "virtual-office",
      name: "Virtual Office",
      shortDescription:
        "Layanan alamat kantor profesional untuk domisili badan usaha tanpa menyewa ruang fisik.",
      description:
        "Virtual Office memberikan alamat kantor yang dapat digunakan sebagai domisili badan usaha. Pintu Legal membantu pengurusan perizinan terkait domisili agar sesuai ketentuan.",
      icon: "MapPin",
      highlights: json([
        "Alamat kantor profesional",
        "Pendampingan perizinan domisili",
        "Pengelolaan korespondensi dasar",
        "Fleksibel untuk startup & UMKM",
      ]),
      processSteps: json([
        "Konsultasi kebutuhan domisili",
        "Penyusunan paket virtual office",
        "Pendampingan perizinan terkait",
      ]),
      requirements: json(["KTP", "NPWP", "Dokumen badan usaha (jika ada)"]),
      durationLabel: "Aktif dalam 1–3 hari kerja",
      categoryId: pendukung.id,
      isFeatured: false,
      sortOrder: 7,
    },
    {
      slug: "layanan-legalitas-lainnya",
      name: "Layanan Legalitas Lainnya",
      shortDescription:
        "Kebutuhan legalitas bisnis lain seperti PKSA, izin usaha khusus, dan pendampingan administrasi.",
      description:
        "Setiap bisnis memiliki kebutuhan legalitas yang berbeda. Pintu Legal membantu mengidentifikasi dan mengurus kebutuhan legalitas lain yang relevan untuk bisnis Anda.",
      icon: "Scale",
      highlights: json([
        "Konsultasi kebutuhan legalitas",
        "Identifikasi perizinan yang relevan",
        "Pendampingan pengurusan",
      ]),
      processSteps: json([
        "Konsultasi kebutuhan",
        "Identifikasi perizinan",
        "Pendampingan proses",
      ]),
      requirements: json(["KTP", "NPWP", "Dokumen pendukung usaha"]),
      durationLabel: "Bervariasi sesuai kebutuhan",
      categoryId: pendukung.id,
      isFeatured: false,
      sortOrder: 8,
    },
  ];

  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  // ── FAQs ──────────────────────────────────────────────────────────────
  const faqs = [
    {
      question: "Apa itu Pintu Legal?",
      answer:
        "Pintu Legal adalah perusahaan jasa legalitas bisnis yang membantu pendirian badan usaha, perizinan, HKI, dan kebutuhan legalitas lainnya. Kami hadir untuk membuat proses legalitas bisnis menjadi lebih jelas dan terarah.",
      category: "Umum",
      sortOrder: 1,
    },
    {
      question: "Apakah Pintu Legal membantu pendirian PT?",
      answer:
        "Ya. Kami mendampingi pendirian PT mulai dari penyiapan dokumen, akta di notaris, hingga SK Kemenkumham dan NIB. Silakan berkonsultasi untuk kebutuhan spesifik Anda.",
      category: "Layanan",
      sortOrder: 2,
    },
    {
      question: "Dokumen apa yang diperlukan?",
      answer:
        "Dokumen bervariasi tergantung layanan. Umumnya meliputi KTP, NPWP, dan dokumen pendukung lain. Setelah konsultasi, tim kami akan memberikan checklist dokumen yang relevan untuk kebutuhan Anda.",
      category: "Layanan",
      sortOrder: 3,
    },
    {
      question: "Berapa lama prosesnya?",
      answer:
        "Estimasi waktu berbeda untuk setiap layanan dan bergantung pada kelengkapan dokumen serta proses instansi terkait. Kami akan memberikan estimasi setelah memahami kebutuhan Anda.",
      category: "Proses",
      sortOrder: 4,
    },
    {
      question: "Apakah proses konsultasi berbayar?",
      answer:
        "Konsultasi awal dapat dilakukan secara gratis. Silakan hubungi kami melalui form konsultasi atau WhatsApp untuk mengetahui informasi lebih lanjut.",
      category: "Umum",
      sortOrder: 5,
    },
    {
      question: "Apakah bisa konsultasi sebelum memesan?",
      answer:
        "Tentu. Anda dapat berkonsultasi terlebih dahulu sebelum memutuskan layanan yang sesuai. Tim kami siap membantu menentukan kebutuhan legalitas bisnis Anda.",
      category: "Umum",
      sortOrder: 6,
    },
    {
      question: "Apakah Pintu Legal membantu perubahan data perusahaan?",
      answer:
        "Ya. Kami membantu perubahan data perusahaan seperti alamat, direksi, atau modal, termasuk pengesahan dan pelaporan ke OSS.",
      category: "Layanan",
      sortOrder: 7,
    },
    {
      question: "Apakah Pintu Legal melayani luar kota?",
      answer:
        "Layanan kami dapat diakses secara online sehingga dapat melayani pelanggan dari berbagai wilayah. Silakan konsultasikan kebutuhan Anda melalui WhatsApp atau form konsultasi.",
      category: "Umum",
      sortOrder: 8,
    },
  ];

  for (const f of faqs) {
    const existing = await db.faq.findFirst({ where: { question: f.question } });
    if (existing) {
      await db.faq.update({ where: { id: existing.id }, data: f });
    } else {
      await db.faq.create({ data: f });
    }
  }

  // ── Blog categories & posts ──────────────────────────────────────────
  const catPanduan = await db.blogCategory.upsert({
    where: { slug: "panduan-bisnis" },
    update: {},
    create: { name: "Panduan Bisnis", slug: "panduan-bisnis" },
  });
  const catLegalitas = await db.blogCategory.upsert({
    where: { slug: "legalitas" },
    update: {},
    create: { name: "Legalitas", slug: "legalitas" },
  });
  const catInfo = await db.blogCategory.upsert({
    where: { slug: "info-perusahaan" },
    update: {},
    create: { name: "Info Perusahaan", slug: "info-perusahaan" },
  });

  const posts = [
    {
      title: "Pendirian PT vs CV: Mana yang Cocok untuk Bisnis Anda?",
      slug: "pendirian-pt-vs-cv",
      excerpt:
        "Memilih bentuk badan usaha adalah keputusan penting. Pelajari perbedaan PT dan CV untuk membantu Anda menentukan pilihan.",
      content:
        "# Pendirian PT vs CV\n\nMemilih bentuk badan usaha adalah langkah penting dalam memulai bisnis. PT dan CV adalah dua pilihan yang paling umum di Indonesia.\n\n## Perbedaan Utama\n\n**PT (Perseroan Terbatas)** memberikan perlindungan terhadap aset pribadi karena tanggung jawab terbatas pada modal disetor. PT cocok untuk bisnis yang ingin berkembang lebih besar, menerima investasi, atau go public di kemudian hari.\n\n**CV (Commanditaire Vennootschap)** lebih sederhana dan umumnya dipilih oleh usaha menengah. Struktur CV lebih fleksibel, tetapi tanggung jawab persekutuan dapat melekat pada sekutu aktif.\n\n## Faktor Pertimbangan\n\n- Skala bisnis\n- Jumlah pendiri\n- Rencana pengembangan\n- Kebutuhan pendanaan\n\n## Kesimpulan\n\nTidak ada pilihan yang lebih baik secara mutlak. Yang penting adalah menyesuaikan bentuk badan usaha dengan tujuan dan kapasitas bisnis Anda. Konsultasikan kebutuhan Anda bersama Pintu Legal untuk menentukan pilihan yang tepat.",
      authorName: "Tim Pintu Legal",
      categoryId: catPanduan.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "Pendirian PT vs CV: Mana yang Cocok untuk Bisnis Anda?",
      metaDescription:
        "Pelajari perbedaan PT dan CV untuk membantu Anda memilih bentuk badan usaha yang sesuai dengan tujuan bisnis.",
    },
    {
      title: "Apa Itu NIB dan Mengapa Penting bagi Pelaku Usaha?",
      slug: "apa-itu-nib",
      excerpt:
        "NIB adalah identitas pelaku usaha yang wajib dimiliki. Pahami fungsi dan cara mengurus NIB melalui OSS.",
      content:
        "# Apa Itu NIB?\n\nNomor Induk Berusaha (NIB) adalah identitas pelaku usaha yang diterbitkan melalui Online Single Submission (OSS). NIB berfungsi sebagai angka pengenal dan hak akses untuk perizinan berusaha.\n\n## Mengapa NIB Penting?\n\n- Sebagai tanda bukti pelaku usaha terdaftar\n- Berlaku sebagai NPWP perusahaan (dalam kondisi tertentu)\n- Akses untuk mengurus perizinan berusaha lainnya\n- Syarat untuk berbagai transaksi bisnis formal\n\n## Cara Mengurus NIB\n\n1. Daftar akun di OSS\n2. Lengkapi data pelaku usaha\n3. Unggah dokumen pendukung\n4. Sistem OSS menerbitkan NIB\n\n## Penutup\n\nNIB adalah fondasi administratif bisnis modern di Indonesia. Jika membutuhkan pendampingan, tim Pintu Legal siap membantu.",
      authorName: "Tim Pintu Legal",
      categoryId: catLegalitas.id,
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86_400_000 * 3),
      metaTitle: "Apa Itu NIB dan Mengapa Penting bagi Pelaku Usaha?",
      metaDescription:
        "Pahami fungsi NIB dan cara mengurusnya melalui OSS untuk pelaku usaha di Indonesia.",
    },
    {
      title: "5 Persiapan Sebelum Mendirikan PT",
      slug: "5-persiapan-sebelum-mendirikan-pt",
      excerpt:
        "Sebelum mengurus pendirian PT, ada beberapa persiapan penting yang perlu Anda lakukan agar proses berjalan lancar.",
      content:
        "# 5 Persiapan Sebelum Mendirikan PT\n\nMendirikan PT memerlukan persiapan matang agar proses berjalan lancar. Berikut lima hal yang perlu Anda siapkan.\n\n## 1. Struktur & Komposisi Pendiri\n\nTentukan siapa saja pendiri, direksi, dan komisaris. Pastikan jumlah modal dan persentase saham disepakati di awal.\n\n## 2. Nama Perusahaan\n\nSediakan beberapa alternatif nama PT karena pengecekan ketersediaan nama dilakukan di Kemenkumham.\n\n## 3. Alamat Kantor\n\nPastikan alamat kantor jelas dan didukung dokumen pendukung yang valid.\n\n## 4. Bidang Usaha\n\nKlasifikasi bidang usaha (KBLI) menentukan perizinan yang relevan melalui OSS.\n\n## 5. Dokumen Pendiri\n\nSiapkan KTP, NPWP, dan dokumen pendukung lain untuk para pendiri dan pengurus.\n\n## Penutup\n\nDengan persiapan yang baik, proses pendirian PT dapat berjalan lebih cepat dan terarah. Pintu Legal siap mendampingi kebutuhan Anda.",
      authorName: "Tim Pintu Legal",
      categoryId: catPanduan.id,
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86_400_000 * 7),
      metaTitle: "5 Persiapan Sebelum Mendirikan PT",
      metaDescription:
        "Lima hal penting yang perlu disiapkan sebelum mendirikan PT agar proses berjalan lancar.",
    },
  ];

  for (const p of posts) {
    await db.blogPost.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // ── Testimonials (clearly-marked placeholders, NOT fake real testimonials) ─
  // Per master prompt: jangan membuat testimonial palsu. We seed NONE and let
  // admin add real ones later. isActive defaults true so we leave table empty.

  console.log("✅ Seed selesai.");
}

main()
  .catch((e) => {
    console.error("Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

import Link from "next/link";
import { ArrowRight, MessageCircle, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/site";
import type { ServiceDetail } from "@/data/queries";

/**
 * Sticky / mobile summary card shown on a service detail page.
 * Renders: service name, duration badge, price label (or fallback), CTAs,
 * and the list of required documents.
 */
export function ServiceSidebar({
  service,
  waMessage,
}: {
  service: ServiceDetail;
  waMessage: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
      <h3 className="text-base font-bold text-navy">{service.name}</h3>

      <dl className="mt-4 space-y-3 border-y border-border py-4">
        {service.durationLabel && (
          <div className="flex items-start justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Clock className="h-4 w-4 text-gold-600" />
              Estimasi
            </dt>
            <dd className="inline-flex items-center rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-600 ring-1 ring-gold-200">
              {service.durationLabel}
            </dd>
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <dt className="text-sm text-ink-soft">Penawaran</dt>
          <dd className="text-right text-sm font-semibold text-navy">
            {service.priceLabel ?? "Konsultasi untuk penawaran"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-2.5">
        <Button asChild className="w-full bg-navy text-white hover:bg-navy-700">
          <Link href="/kontak">
            Konsultasi Gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full border-gold-400 text-gold-600 hover:bg-gold-50 hover:text-gold-600"
        >
          <a
            href={waLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Chat via WhatsApp
          </a>
        </Button>
      </div>

      {service.requirements.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
            <FileText className="h-3.5 w-3.5" />
            Dokumen yang Diperlukan
          </h4>
          <ul className="mt-3 space-y-2">
            {service.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                <span
                  aria-hidden
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy-400"
                />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Generic professional audience bullets — derived from the service slug.
 * Kept intentionally broad; no fake specifics. Falls back to a generic
 * professional set for any slug not in the map.
 */
export function deriveAudience(slug: string): string[] {
  const map: Record<string, string[]> = {
    "pendirian-pt": [
      "Pendiri bisnis yang membutuhkan badan hukum Perseroan Terbatas.",
      "Tim yang merencanakan pendanaan atau investasi dari pihak luar.",
      "Perusahaan yang membutuhkan struktur tanggung jawab terbatas.",
    ],
    "pendirian-cv": [
      "Pelaku usaha menengah yang membutuhkan bentuk badan usaha sederhana.",
      "Tim pendiri dengan jumlah sekutu terbatas.",
      "Usaha yang baru memulai dan ingin memiliki badan hukum.",
    ],
    "pendirian-yayasan": [
      "Pembina organisasi sosial, keagamaan, atau kemanusiaan.",
      "Tim yang ingin membentuk badan hukum nirlaba.",
      "Kelompok yang mengelola kegiatan sosial jangka panjang.",
    ],
    "perubahan-data-perusahaan": [
      "Perusahaan yang melakukan perubahan alamat, direksi, atau modal.",
      "Tim pengurus yang memutakhirkan data sesuai dokumen terbaru.",
      "Badan usaha yang perlu menyelaraskan data dengan OSS.",
    ],
    "pendaftaran-merek-hki": [
      "Pemilik bisnis yang ingin melindungi merek dagang.",
      "Kreator yang ingin mendaftarkan hak cipta karyanya.",
      "Tim inovasi yang membutuhkan perlindungan paten.",
    ],
    "nib-oss": [
      "Pelaku usaha baru yang membutuhkan NIB.",
      "Perusahaan yang ingin memutakhirkan perizinan berusaha.",
      "Tim yang mengurus klasifikasi risiko usaha melalui OSS.",
    ],
    "virtual-office": [
      "Startup dan UMKM yang membutuhkan domisili resmi.",
      "Bisnis tanpa ruang fisik tetapi memerlukan alamat kantor.",
      "Tim yang ingin fleksibilitas lokasi tanpa biaya sewa penuh.",
    ],
    "layanan-legalitas-lainnya": [
      "Bisnis dengan kebutuhan legalitas di luar paket standar.",
      "Tim yang ingin mengidentifikasi perizinan yang relevan.",
      "Perusahaan yang membutuhkan pendampingan administrasi khusus.",
    ],
  };
  return (
    map[slug] ?? [
      "Pelaku usaha yang membutuhkan pendampingan legalitas profesional.",
      "Tim bisnis yang ingin memastikan kepatuhan terhadap ketentuan.",
      "Perusahaan yang sedang menyusun fondasi legalitas jangka panjang.",
      "Pendiri yang membutuhkan kejelasan proses dan dokumen yang diperlukan.",
    ]
  );
}

import { siteConfig } from "@/lib/site";

/**
 * WhatsApp message templates for common lead scenarios.
 * These pre-fill the WhatsApp message with context-appropriate content.
 */

export type LeadContext = {
  name: string;
  phone: string;
  serviceName?: string | null;
  businessName?: string | null;
  message?: string | null;
};

/**
 * Build a wa.me URL with a pre-filled message.
 */
function waUrl(phone: string, message: string): string {
  const normalized = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * Template: Initial follow-up — friendly introduction + service context.
 */
export function waTemplateFollowUp(lead: LeadContext): string {
  return waUrl(
    lead.phone,
    `Halo ${lead.name}, terima kasih telah menghubungi Pintu Legal. ` +
      `Saya dari tim Pintu Legal ingin menindaklanjuti konsultasi Anda` +
      `${lead.serviceName ? ` mengenai ${lead.serviceName}` : ""}. ` +
      `Apakah ada waktu yang nyaman untuk berdiskusi?`
  );
}

/**
 * Template: Status update — notify lead of progress.
 */
export function waTemplateStatusUpdate(lead: LeadContext, status: string): string {
  const statusMessages: Record<string, string> = {
    CONTACTED: `Halo ${lead.name}, kami telah menerima permintaan Anda dan sedang meninjau kebutuhan legalitas bisnis Anda. Tim kami akan segera menghubungi Anda untuk informasi lebih lanjut.`,
    QUALIFIED: `Halo ${lead.name}, setelah meninjau kebutuhan Anda, kami siap melanjutkan proses legalitas bisnis Anda. Mohon siapkan dokumen yang diperlukan dan kami akan memandu Anda langkah demi langkah.`,
    CONVERTED: `Halo ${lead.name}, selamat! Proses legalitas bisnis Anda telah selesai. Dokumen telah diserahkan. Terima kasih telah mempercayakan kebutuhan legalitas Anda kepada Pintu Legal.`,
    LOST: `Halo ${lead.name}, terima kasih telah menghubungi Pintu Legal. Jika di masa depan Anda membutuhkan bantuan legalitas bisnis, kami siap membantu. Salam sukses!`,
  };

  const msg = statusMessages[status] ?? `Halo ${lead.name}, kami ingin memberikan update mengenai kebutuhan legalitas Anda.`;
  return waUrl(lead.phone, msg);
}

/**
 * Template: Document reminder — ask lead to prepare documents.
 */
export function waTemplateDocumentReminder(lead: LeadContext, serviceName?: string): string {
  return waUrl(
    lead.phone,
    `Halo ${lead.name}, untuk melanjutkan proses${serviceName ? ` ${serviceName}` : ""}, ` +
      `mohon siapkan dokumen berikut:\n\n` +
      `1. KTP\n2. NPWP\n3. Dokumen pendukung lainnya\n\n` +
      `Anda dapat mengirimkan dokumen melalui chat ini atau email. Terima kasih!`
  );
}

/**
 * Template: Consultation scheduling — propose a consultation time.
 */
export function waTemplateScheduleConsultation(lead: LeadContext): string {
  return waUrl(
    lead.phone,
    `Halo ${lead.name}, kami ingin menjadwalkan konsultasi dengan Anda. ` +
      `Berikut beberapa pilihan waktu:\n\n` +
      `• Senin-Jumat, 09.00-17.00 WIB\n• Sabtu, 09.00-13.00 WIB\n\n` +
      `Mohon beri tahu waktu yang paling nyaman untuk Anda. Terima kasih!`
  );
}

/**
 * Template: General greeting — for new leads without specific context.
 */
export function waTemplateGeneral(lead: LeadContext): string {
  return waUrl(
    lead.phone,
    `Halo ${lead.name}, terima kasih telah menghubungi Pintu Legal. ` +
      `Tim kami siap membantu kebutuhan legalitas bisnis Anda. ` +
      `Apa yang bisa kami bantu hari ini?`
  );
}

import "server-only";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site";

/**
 * PINTU LEGAL — Lead notification system.
 *
 * Sends a notification whenever a new lead is created. The notification is
 * "best-effort" — it MUST NEVER throw or block the caller. If anything fails,
 * we log to the server console and move on.
 *
 * Notification channels (in priority order):
 *   1. Webhook — if `LEAD_WEBHOOK_URL` env var OR the `lead_webhook_url` site
 *      setting is set, POST the lead payload as JSON to that URL.
 *   2. Console — fallback when no channel is configured. Logs a readable
 *      summary of the new lead so an operator watching the dev server log
 *      sees it arrive.
 *
 * The `admin_notification_email` site setting (or `ADMIN_NOTIFICATION_EMAIL`
 * env var) is included in the payload as a hint for downstream consumers,
 * but this module does not send email directly (SMTP is intentionally not
 * bundled to keep the sandbox dependency-free).
 */

/** A lead-shaped payload accepted by `sendLeadNotification`. Only the
 *  fields actually needed for a useful notification are required. */
export type LeadNotificationPayload = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  businessName?: string | null;
  serviceId?: string | null;
  serviceName?: string | null;
  message: string;
  source?: string | null;
  status?: string | null;
  createdAt: string | Date;
};

export type NotificationChannel = "webhook" | "console";

export type NotificationResult = {
  ok: boolean;
  channel: NotificationChannel;
  /** Human-readable explanation for the result — useful for the admin UI. */
  message: string;
  /** ISO timestamp of the attempt. */
  at: string;
};

/** Read a single site setting by key, returns "" if missing. */
async function readSetting(key: string): Promise<string> {
  try {
    const row = await db.siteSetting.findUnique({ where: { key } });
    return row?.value?.trim() ?? "";
  } catch {
    return "";
  }
}

/**
 * Resolve the active notification config. Env vars take precedence over
 * DB site settings (so operators can override via the environment without
 * touching the DB), but DB settings provide a runtime-editable default.
 */
export async function resolveNotificationConfig(): Promise<{
  webhookUrl: string;
  adminEmail: string;
  channel: NotificationChannel;
}> {
  const envWebhook = (process.env.LEAD_WEBHOOK_URL ?? "").trim();
  const envEmail = (process.env.ADMIN_NOTIFICATION_EMAIL ?? "").trim();
  const [dbWebhook, dbEmail] = await Promise.all([
    readSetting("lead_webhook_url"),
    readSetting("admin_notification_email"),
  ]);
  const webhookUrl = envWebhook || dbWebhook;
  const adminEmail = envEmail || dbEmail;
  const channel: NotificationChannel = webhookUrl ? "webhook" : "console";
  return { webhookUrl, adminEmail, channel };
}

function payloadToBody(lead: LeadNotificationPayload, adminEmail: string) {
  return {
    event: "lead.created",
    at: new Date().toISOString(),
    site: siteConfig.brandName,
    company: siteConfig.companyName,
    adminEmail: adminEmail || null,
    lead: {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email ?? null,
      businessName: lead.businessName ?? null,
      serviceId: lead.serviceId ?? null,
      serviceName: lead.serviceName ?? null,
      message: lead.message,
      source: lead.source ?? "WEBSITE",
      status: lead.status ?? "NEW",
      createdAt:
        lead.createdAt instanceof Date
          ? lead.createdAt.toISOString()
          : lead.createdAt,
    },
  };
}

function summarize(lead: LeadNotificationPayload): string {
  const parts = [
    `Nama: ${lead.name}`,
    `Telepon: ${lead.phone}`,
  ];
  if (lead.email) parts.push(`Email: ${lead.email}`);
  if (lead.businessName) parts.push(`Bisnis: ${lead.businessName}`);
  if (lead.serviceName) parts.push(`Layanan: ${lead.serviceName}`);
  parts.push(`Pesan: ${lead.message}`);
  return parts.join("\n  ");
}

/**
 * Send a "new lead" notification. ALWAYS resolves (never throws).
 *
 * Resolution rules:
 *   - Webhook configured → POST JSON to webhook URL with a 6s timeout.
 *     Returns `{ok: true}` on 2xx, `{ok: false}` otherwise.
 *   - No webhook → log a readable summary to the server console and
 *     return `{ok: true, channel: "console"}`.
 */
export async function sendLeadNotification(
  lead: LeadNotificationPayload
): Promise<NotificationResult> {
  const at = new Date().toISOString();
  const { webhookUrl, adminEmail, channel } = await resolveNotificationConfig();

  if (channel === "console" || !webhookUrl) {
    console.info(
      `[notifications] new lead arrived (no webhook configured — logging to console)\n  ${summarize(
        lead
      )}`
    );
    return {
      ok: true,
      channel: "console",
      message: adminEmail
        ? `Notifikasi dicatat di log server (webhook belum dikonfigurasi, email admin: ${adminEmail}).`
        : "Notifikasi dicatat di log server. Konfigurasi webhook atau email admin di Pengaturan.",
      at,
    };
  }

  try {
    const body = JSON.stringify(payloadToBody(lead, adminEmail));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    let res: Response;
    try {
      res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "PintuLegal/1.0 (+https://pintulegal.id)",
        },
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (res.ok) {
      return {
        ok: true,
        channel: "webhook",
        message: `Notifikasi terkirim ke webhook (${res.status} ${res.statusText}).`,
        at,
      };
    }
    console.warn(
      `[notifications] webhook returned non-OK status ${res.status} ${res.statusText}`
    );
    return {
      ok: false,
      channel: "webhook",
      message: `Webhook merespons ${res.status} ${res.statusText}.`,
      at,
    };
  } catch (err) {
    const reason =
      err instanceof Error
        ? err.name === "AbortError"
          ? "timeout setelah 6 detik"
          : err.message
        : "unknown error";
    console.warn(`[notifications] webhook failed: ${reason}`);
    return {
      ok: false,
      channel: "webhook",
      message: `Gagal mengirim webhook (${reason}).`,
      at,
    };
  }
}

/**
 * Fire a "test" notification (used by the admin "Test Notifikasi" button).
 * Uses a synthetic lead payload so the operator can verify the channel
 * without creating a real lead in the DB.
 */
export async function sendTestNotification(): Promise<NotificationResult> {
  const fakeLead: LeadNotificationPayload = {
    id: `test-${Date.now()}`,
    name: "Notifikasi Uji",
    phone: "0000000000",
    email: "test@example.com",
    businessName: "PT. Contoh",
    serviceName: "Pendirian PT",
    message:
      "Ini adalah notifikasi uji dari panel admin Pintu Legal untuk memverifikasi konfigurasi webhook.",
    source: "ADMIN",
    status: "NEW",
    createdAt: new Date(),
  };
  return sendLeadNotification(fakeLead);
}

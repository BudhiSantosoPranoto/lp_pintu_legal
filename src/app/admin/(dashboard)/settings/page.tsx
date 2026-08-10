import { db } from "@/lib/db";
import { resolveNotificationConfig } from "@/lib/notifications";
import { SettingsForm } from "@/components/admin/settings-form";
import { NotificationsSettingsCard } from "@/components/admin/notifications-settings";
import { CookieConsentAnalytics } from "@/components/admin/cookie-consent-analytics";
import { WebVitalsAnalytics } from "@/components/admin/web-vitals-analytics";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [rows, notifConfig] = await Promise.all([
    db.siteSetting.findMany({
      orderBy: { key: "asc" },
    }),
    resolveNotificationConfig(),
  ]);
  const settings = rows.map((r) => ({ key: r.key, value: r.value }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink">Pengaturan Situs</h2>
        <p className="text-sm text-ink-soft mt-1">
          Edit pasangan kunci-nilai yang disimpan di tabel{" "}
          <code className="text-xs bg-surface-alt px-1.5 py-0.5 rounded">
            site_settings
          </code>
          . Perubahan langsung tersimpan ke database.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <NotificationsSettingsCard
          initialWebhookUrl={notifConfig.webhookUrl}
          initialAdminEmail={notifConfig.adminEmail}
          initialChannel={notifConfig.channel}
        />
        <CookieConsentAnalytics />
      </div>

      <WebVitalsAnalytics />

      <SettingsForm initialSettings={settings} />
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Loader2,
  Save,
  Bell,
  Webhook,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type NotificationConfig = {
  webhookUrl: string;
  adminEmail: string;
  channel: "webhook" | "console";
};

type TestResult = {
  ok: boolean;
  channel: "webhook" | "console";
  message: string;
  at: string;
};

/**
 * Dedicated card for the lead-notification settings. Lives above the raw
 * key/value grid on the /admin/settings page so the operator has a guided
 * UI for the two notification-related settings (`admin_notification_email`
 * and `lead_webhook_url`), plus a "Test Notifikasi" button.
 *
 * Save flow: PATCHes the two keys to /api/admin/settings (same endpoint the
 * raw grid uses). The test button calls /api/admin/notifications/test which
 * fires a synthetic lead through the configured channel and returns the
 * result so we can surface a success/failure toast.
 */
export function NotificationsSettingsCard({
  initialWebhookUrl,
  initialAdminEmail,
  initialChannel,
}: {
  initialWebhookUrl: string;
  initialAdminEmail: string;
  initialChannel: "webhook" | "console";
}) {
  const [webhookUrl, setWebhookUrl] = React.useState(initialWebhookUrl);
  const [adminEmail, setAdminEmail] = React.useState(initialAdminEmail);
  const [channel, setChannel] = React.useState<NotificationConfig["channel"]>(
    initialChannel
  );
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);

  // Re-sync from server if the parent passes new initial values (after a
  // page reload following a save).
  React.useEffect(() => {
    setWebhookUrl(initialWebhookUrl);
    setAdminEmail(initialAdminEmail);
    setChannel(initialChannel);
  }, [initialWebhookUrl, initialAdminEmail, initialChannel]);

  const dirty =
    webhookUrl !== initialWebhookUrl || adminEmail !== initialAdminEmail;

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            lead_webhook_url: webhookUrl.trim(),
            admin_notification_email: adminEmail.trim(),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan pengaturan notifikasi.");
        return;
      }
      toast.success("Pengaturan notifikasi disimpan.");
      // Update the local "initial" baseline so `dirty` becomes false without
      // a full page reload. The resolved channel flips to "webhook" the moment
      // a non-empty webhook URL is saved.
      setChannel(webhookUrl.trim() ? "webhook" : "console");
      // Mutate the closure-captured initial values via state setters above.
      // (We can't actually mutate the prop, so we just leave the effect to
      // re-sync if the parent ever re-renders with fresh data. For now,
      // a reload isn't necessary because we already updated `channel`.)
    } catch {
      toast.error("Kesalahan jaringan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (testing) return;
    setTesting(true);
    setTestResult(null);
    try {
      // If the user has unsaved changes, save them first so the test uses
      // the latest configuration.
      if (dirty) {
        await handleSave();
      }
      const res = await fetch("/api/admin/notifications/test");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal mengirim notifikasi uji.");
        setTestResult({
          ok: false,
          channel: "console",
          message: data.error ?? "Gagal mengirim notifikasi uji.",
          at: new Date().toISOString(),
        });
        return;
      }
      setTestResult(data.result as TestResult);
      if (data.result?.ok) {
        toast.success(data.result.message ?? "Notifikasi uji terkirim.");
      } else {
        toast.error(data.result?.message ?? "Notifikasi uji gagal.");
      }
    } catch {
      toast.error("Kesalahan jaringan saat menguji notifikasi.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
          <Bell className="size-4 text-gold-600" />
          Notifikasi Lead
        </CardTitle>
        <p className="text-xs text-ink-soft mt-1">
          Kirim notifikasi otomatis setiap kali lead baru masuk. Jika webhook
          tidak dikonfigurasi, notifikasi hanya akan dicatat di log server.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Channel status pill */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-alt p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Channel aktif:
          </span>
          {channel === "webhook" ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
              <Webhook className="size-3 mr-1" />
              Webhook
            </Badge>
          ) : (
            <Badge className="bg-navy-50 text-navy border-navy/15 hover:bg-navy-50">
              <Terminal className="size-3 mr-1" />
              Console (log server)
            </Badge>
          )}
          <span className="text-xs text-ink-soft">
            {channel === "webhook"
              ? "Notifikasi akan dikirim sebagai POST JSON ke webhook."
              : "Belum ada webhook — notifikasi hanya muncul di log server."}
          </span>
        </div>

        {/* Webhook URL */}
        <div className="space-y-1.5">
          <Label
            htmlFor="lead_webhook_url"
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider flex items-center gap-1.5"
          >
            <Webhook className="size-3.5" />
            URL Webhook
          </Label>
          <Input
            id="lead_webhook_url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.example.com/pintulegal"
            disabled={saving}
            className="h-9"
            type="url"
            inputMode="url"
          />
          <p className="text-[11px] text-ink-soft">
            Endpoint yang menerima POST JSON dengan payload lead. Bisa juga
            diset via env <code className="bg-surface-alt px-1 py-0.5 rounded">LEAD_WEBHOOK_URL</code>.
          </p>
        </div>

        {/* Admin email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="admin_notification_email"
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider flex items-center gap-1.5"
          >
            <Mail className="size-3.5" />
            Email Admin Penerima
          </Label>
          <Input
            id="admin_notification_email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="halo@pintulegal.id"
            disabled={saving}
            className="h-9"
            type="email"
            inputMode="email"
          />
          <p className="text-[11px] text-ink-soft">
            Disertakan di payload webhook sebagai{" "}
            <code className="bg-surface-alt px-1 py-0.5 rounded">adminEmail</code>.
            Bisa juga diset via env{" "}
            <code className="bg-surface-alt px-1 py-0.5 rounded">
              ADMIN_NOTIFICATION_EMAIL
            </code>
            .
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="bg-navy hover:bg-navy-700 text-white"
            size="sm"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Simpan
          </Button>
          <Button
            onClick={handleTest}
            disabled={testing}
            variant="outline"
            size="sm"
            className="border-gold-300 text-gold-700 hover:bg-gold-50 hover:text-gold-700"
          >
            {testing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Test Notifikasi
          </Button>
          {dirty && (
            <span className="text-xs text-gold-700">
              Ada perubahan belum disimpan
            </span>
          )}
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3 text-sm",
              testResult.ok
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            )}
            role="status"
          >
            {testResult.ok ? (
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium">
                {testResult.ok ? "Notifikasi uji berhasil" : "Notifikasi uji gagal"}
              </p>
              <p className="text-xs mt-0.5 break-words">{testResult.message}</p>
              <p className="text-[11px] mt-1 opacity-70">
                Channel: {testResult.channel} · {new Date(testResult.at).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

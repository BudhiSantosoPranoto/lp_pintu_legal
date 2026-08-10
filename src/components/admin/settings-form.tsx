"use client";

import * as React from "react";
import { Loader2, Save, Plus, Trash2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Setting = { key: string; value: string };

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: Setting[];
}) {
  const [settings, setSettings] = React.useState<Setting[]>(initialSettings);
  const [newKey, setNewKey] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  // Re-sync when the server passes new initial settings (e.g. after refresh)
  React.useEffect(() => {
    setSettings(initialSettings);
    setDirty(false);
  }, [initialSettings]);

  function updateValue(idx: number, value: string) {
    setSettings((s) => s.map((row, i) => (i === idx ? { ...row, value } : row)));
    setDirty(true);
  }

  function addRow() {
    const key = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key) {
      toast.error("Kunci tidak boleh kosong.");
      return;
    }
    if (settings.some((s) => s.key === key)) {
      toast.error(`Kunci "${key}" sudah ada.`);
      return;
    }
    setSettings((s) => [...s, { key, value: newValue }]);
    setNewKey("");
    setNewValue("");
    setDirty(true);
    toast.success(`Kunci "${key}" ditambahkan. Klik Simpan untuk menyimpan.`);
  }

  function removeRow(idx: number) {
    setSettings((s) => s.filter((_, i) => i !== idx));
    setDirty(true);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      for (const s of settings) {
        payload[s.key] = s.value;
      }
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan pengaturan.");
        return;
      }
      toast.success("Pengaturan disimpan.");
      setDirty(false);
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-navy hover:bg-navy-700 text-white"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Simpan Perubahan
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
            <SettingsIcon className="size-4 text-gold-600" />
            Pasangan Kunci-Nilai ({settings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {settings.length === 0 ? (
            <div className="py-8 text-center text-ink-soft text-sm">
              Belum ada pengaturan. Tambahkan kunci baru di bawah.
            </div>
          ) : (
            settings.map((s, idx) => (
              <div
                key={s.key}
                className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-2 items-start sm:items-center"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <code className="text-xs bg-navy-50 text-navy px-2 py-1 rounded font-mono truncate">
                    {s.key}
                  </code>
                </div>
                <Input
                  value={s.value}
                  onChange={(e) => updateValue(idx, e.target.value)}
                  disabled={saving}
                  className="h-9"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-destructive hover:text-destructive hover:bg-destructive/5"
                  onClick={() => removeRow(idx)}
                  disabled={saving}
                  aria-label={`Hapus ${s.key}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add new setting */}
      <Card className="shadow-soft border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-ink flex items-center gap-2">
            <Plus className="size-4 text-gold-600" />
            Tambah Pengaturan Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-2 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs text-ink-soft">Kunci</Label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="contoh: hero_title"
                className="h-9 font-mono text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRow();
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-ink-soft">Nilai</Label>
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="nilai pengaturan"
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRow();
                  }
                }}
              />
            </div>
            <Button onClick={addRow} variant="outline" className="h-9">
              <Plus className="size-4" />
              Tambah
            </Button>
          </div>
          <p className="text-xs text-ink-soft mt-3">
            Catatan: perubahan pada pengaturan hanya akan memengaruhi komponen
            yang membaca dari tabel <code>site_settings</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

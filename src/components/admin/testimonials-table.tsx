"use client";

import * as React from "react";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  Quote,
  Star,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TestimonialRow = {
  id: string;
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
  isActive: boolean;
  sortOrder: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    company: "",
    role: "",
    quote: "",
    rating: 5,
    isActive: true,
    sortOrder: "0",
  };
}

export function TestimonialsTable({
  testimonials,
}: {
  testimonials: TestimonialRow[];
}) {
  const [editing, setEditing] = React.useState<TestimonialRow | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-navy hover:bg-navy-700 text-white"
          size="sm"
        >
          <Plus className="size-4" />
          Tambah Testimoni
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-surface-alt/50">
              <TableHead className="pl-4 w-10">#</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Perusahaan</TableHead>
              <TableHead className="text-center">Rating</TableHead>
              <TableHead className="text-center">Aktif</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-ink-soft text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Quote className="size-6 opacity-40" />
                    Belum ada testimoni.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((t) => (
                <TestimonialRowItem
                  key={t.id}
                  item={t}
                  onEdit={() => setEditing(t)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TestimonialEditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        item={editing}
        mode="edit"
      />
      <TestimonialEditDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        item={null}
        mode="create"
      />
    </div>
  );
}

function TestimonialRowItem({
  item,
  onEdit,
}: {
  item: TestimonialRow;
  onEdit: () => void;
}) {
  const [isActive, setIsActive] = React.useState(item.isActive);
  const [toggling, setToggling] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function toggleActive() {
    setToggling(true);
    const next = !isActive;
    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal memperbarui status.");
        return;
      }
      setIsActive(next);
      toast.success(next ? "Testimoni diaktifkan." : "Testimoni dinonaktifkan.");
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus testimoni ini?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menghapus.");
        return;
      }
      toast.success("Testimoni dihapus.");
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="pl-4 text-ink-soft text-xs">
        <div className="flex items-center gap-1">
          <GripVertical className="size-3.5 opacity-40" />
          {item.sortOrder}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium text-ink">{item.name}</div>
        {item.role && (
          <div className="text-xs text-ink-soft">{item.role}</div>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {item.company ? (
          <Badge variant="outline" className="bg-surface-alt text-ink-soft">
            {item.company}
          </Badge>
        ) : (
          <span className="text-xs text-ink-soft">—</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="inline-flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-3.5",
                i < item.rating
                  ? "fill-gold text-gold"
                  : "text-ink-soft/30"
              )}
            />
          ))}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <button
          onClick={toggleActive}
          disabled={toggling}
          aria-label="Toggle aktif"
        >
          <Switch checked={isActive} disabled={toggling} />
        </button>
      </TableCell>
      <TableCell className="pr-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/5"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TestimonialEditDialog({
  open,
  onOpenChange,
  item,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TestimonialRow | null;
  mode: "edit" | "create";
}) {
  const [form, setForm] = React.useState<FormState>(emptyForm());
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && item) {
      setForm({
        name: item.name,
        company: item.company,
        role: item.role,
        quote: item.quote,
        rating: item.rating,
        isActive: item.isActive,
        sortOrder: String(item.sortOrder),
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, item, mode]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi.");
      return;
    }
    if (!form.quote.trim()) {
      toast.error("Kutipan testimoni wajib diisi.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      company: form.company.trim() || null,
      role: form.role.trim() || null,
      quote: form.quote.trim(),
      rating: Math.max(1, Math.min(5, Number(form.rating) || 5)),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      const url =
        mode === "create"
          ? "/api/admin/testimonials"
          : `/api/admin/testimonials/${item?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan testimoni.");
        return;
      }
      toast.success(
        mode === "create" ? "Testimoni ditambahkan." : "Testimoni diperbarui."
      );
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-ink">
            {mode === "create" ? "Tambah Testimoni" : "Edit Testimoni"}
          </DialogTitle>
          <DialogDescription>
            Pastikan testimoni telah mendapat izin dari klien sebelum dipublikasikan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama" required>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                disabled={saving}
              />
            </Field>
            <Field label="Perusahaan">
              <Input
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="PT. Contoh Sukses"
                disabled={saving}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Jabatan">
              <Input
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                placeholder="Founder"
                disabled={saving}
              />
            </Field>
            <Field label="Rating">
              <div className="flex items-center gap-1 h-9">
                {Array.from({ length: 5 }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => update("rating", n)}
                      aria-label={`Rating ${n}`}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "size-5 transition-colors",
                          n <= form.rating
                            ? "fill-gold text-gold"
                            : "text-ink-soft/30 hover:text-gold-400"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Urutan">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          <Field label="Kutipan Testimoni" required>
            <Textarea
              value={form.quote}
              onChange={(e) => update("quote", e.target.value)}
              placeholder="Pengalaman klien dengan layanan Pintu Legal…"
              disabled={saving}
              className="min-h-24 resize-y"
              maxLength={1000}
            />
          </Field>

          <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => update("isActive", v)}
              disabled={saving}
            />
            <span className="text-sm font-medium text-ink">Aktif</span>
            <span className="text-xs text-ink-soft">
              (tampil di situs publik)
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-navy hover:bg-navy-700 text-white"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-ink-soft">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

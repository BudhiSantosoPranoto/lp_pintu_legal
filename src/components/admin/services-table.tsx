"use client";

import * as React from "react";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Star,
  Briefcase,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ServiceIcon } from "@/components/site/service-icon";

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  durationLabel: string;
  priceLabel: string;
  categoryId: string;
  categoryName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  highlights: string;
  processSteps: string;
  requirements: string;
  faqsJson: string;
};

type CategoryOption = { id: string; name: string; slug: string };

type FormState = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  durationLabel: string;
  priceLabel: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    icon: "Building2",
    durationLabel: "",
    priceLabel: "",
    categoryId: "",
    isActive: true,
    isFeatured: false,
    sortOrder: "0",
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ServicesTable({
  services,
  categories,
  iconNames,
}: {
  services: ServiceRow[];
  categories: CategoryOption[];
  iconNames: string[];
}) {
  const [editing, setEditing] = React.useState<ServiceRow | null>(null);
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
          Layanan Baru
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-surface-alt/50">
              <TableHead className="pl-4 w-10"></TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Kategori</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="text-center">Aktif</TableHead>
              <TableHead className="text-center">Unggulan</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-ink-soft text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase className="size-6 opacity-40" />
                    Belum ada layanan. Tambahkan yang pertama.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <ServiceRowItem
                  key={s.id}
                  service={s}
                  onEdit={() => setEditing(s)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceEditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        service={editing}
        categories={categories}
        iconNames={iconNames}
        mode="edit"
      />
      <ServiceEditDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        service={null}
        categories={categories}
        iconNames={iconNames}
        mode="create"
      />
    </div>
  );
}

function ServiceRowItem({
  service,
  onEdit,
}: {
  service: ServiceRow;
  onEdit: () => void;
}) {
  const [isActive, setIsActive] = React.useState(service.isActive);
  const [isFeatured, setIsFeatured] = React.useState(service.isFeatured);
  const [togglingActive, setTogglingActive] = React.useState(false);
  const [togglingFeatured, setTogglingFeatured] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function toggleActive() {
    setTogglingActive(true);
    const next = !isActive;
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal memperbarui status aktif.");
        return;
      }
      setIsActive(next);
      toast.success(next ? "Layanan diaktifkan." : "Layanan dinonaktifkan.");
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setTogglingActive(false);
    }
  }

  async function toggleFeatured() {
    setTogglingFeatured(true);
    const next = !isFeatured;
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal memperbarui tanda unggulan.");
        return;
      }
      setIsFeatured(next);
      toast.success(next ? "Ditandai unggulan." : "Dihapus dari unggulan.");
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setTogglingFeatured(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Hapus layanan "${service.name}"? Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menghapus layanan.");
        return;
      }
      toast.success("Layanan dihapus.");
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="pl-4 text-ink-soft">
        <div className="flex items-center gap-1 text-xs">
          <GripVertical className="size-3.5 opacity-40" />
          {service.sortOrder}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center justify-center size-8 rounded-lg bg-navy-50 text-navy shrink-0">
            <ServiceIcon name={service.icon} className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-ink truncate">{service.name}</div>
            <div className="text-xs text-ink-soft truncate max-w-xs">
              {service.shortDescription}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {service.categoryName ? (
          <Badge variant="outline" className="bg-surface-alt text-ink-soft">
            {service.categoryName}
          </Badge>
        ) : (
          <span className="text-xs text-ink-soft">—</span>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-xs text-ink-soft font-mono">
        /{service.slug}
      </TableCell>
      <TableCell className="text-center">
        <button
          onClick={toggleActive}
          disabled={togglingActive}
          aria-label="Toggle aktif"
          className="inline-flex"
        >
          <Switch checked={isActive} disabled={togglingActive} />
        </button>
      </TableCell>
      <TableCell className="text-center">
        <button
          onClick={toggleFeatured}
          disabled={togglingFeatured}
          aria-label="Toggle unggulan"
          className={cn(
            "inline-flex items-center justify-center size-8 rounded-md transition-colors",
            isFeatured
              ? "text-gold-600 bg-gold-50 hover:bg-gold-100"
              : "text-ink-soft opacity-40 hover:opacity-100 hover:bg-surface-alt"
          )}
        >
          {togglingFeatured ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Star className={cn("size-4", isFeatured && "fill-gold")} />
          )}
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

function ServiceEditDialog({
  open,
  onOpenChange,
  service,
  categories,
  iconNames,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRow | null;
  categories: CategoryOption[];
  iconNames: string[];
  mode: "edit" | "create";
}) {
  const [form, setForm] = React.useState<FormState>(emptyForm());
  const [saving, setSaving] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && service) {
      setForm({
        name: service.name,
        slug: service.slug,
        shortDescription: service.shortDescription,
        description: service.description,
        icon: service.icon,
        durationLabel: service.durationLabel,
        priceLabel: service.priceLabel,
        categoryId: service.categoryId,
        isActive: service.isActive,
        isFeatured: service.isFeatured,
        sortOrder: String(service.sortOrder),
      });
      setSlugTouched(true);
    } else {
      setForm(emptyForm());
      setSlugTouched(false);
    }
  }, [open, service, mode]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !slugTouched) {
        next.slug = slugify(value as string);
      }
      if (key === "slug") setSlugTouched(true);
      return next;
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Nama layanan wajib diisi.");
      return;
    }
    if (!form.shortDescription.trim()) {
      toast.error("Deskripsi singkat wajib diisi.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug wajib diisi.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      icon: form.icon,
      durationLabel: form.durationLabel.trim() || null,
      priceLabel: form.priceLabel.trim() || null,
      categoryId: form.categoryId || null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      const url =
        mode === "create"
          ? "/api/admin/services"
          : `/api/admin/services/${service?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan layanan.");
        return;
      }
      toast.success(
        mode === "create" ? "Layanan ditambahkan." : "Layanan diperbarui."
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-ink">
            {mode === "create" ? "Tambah Layanan" : "Edit Layanan"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi detail layanan baru. Anda bisa menyesuaikan highlight & proses kemudian."
              : "Perbarui informasi layanan ini."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Nama Layanan" required>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Pendirian PT"
                disabled={saving}
              />
            </Field>
            <Field label="Slug (URL)" required>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                placeholder="pendirian-pt"
                disabled={saving}
                className="font-mono text-sm"
              />
            </Field>
          </div>

          <Field label="Deskripsi Singkat" required>
            <Input
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              placeholder="Satu kalimat ringkas tentang layanan ini."
              disabled={saving}
              maxLength={200}
            />
          </Field>

          <Field label="Deskripsi Lengkap">
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Penjelasan lengkap layanan. Akan ditampilkan di halaman detail."
              disabled={saving}
              className="min-h-24 resize-y"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Ikon">
              <Select value={form.icon} onValueChange={(v) => update("icon", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconNames.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Durasi">
              <Input
                value={form.durationLabel}
                onChange={(e) => update("durationLabel", e.target.value)}
                placeholder="7–14 hari kerja"
                disabled={saving}
              />
            </Field>
            <Field label="Label Harga">
              <Input
                value={form.priceLabel}
                onChange={(e) => update("priceLabel", e.target.value)}
                placeholder="Kosongkan jika tidak ditampilkan"
                disabled={saving}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kategori">
              <Select
                value={form.categoryId || "__none"}
                onValueChange={(v) =>
                  update("categoryId", v === "__none" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tanpa kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">— Tanpa kategori —</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
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
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(v) => update("isFeatured", v)}
                disabled={saving}
              />
              <span className="text-sm font-medium text-ink">Unggulan</span>
              <span className="text-xs text-ink-soft">
                (highlight di beranda)
              </span>
            </label>
          </div>
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

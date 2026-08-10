"use client";

import * as React from "react";
import Link from "next/link";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  Folder,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export type BlogCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  postCount: number;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string; // keep as string so empty input is valid
};

function emptyForm(): FormState {
  return { name: "", slug: "", description: "", sortOrder: "0" };
}

function fromRow(row: BlogCategoryRow): FormState {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    sortOrder: String(row.sortOrder ?? 0),
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

/**
 * Admin UI for managing blog categories (CRUD). Receives the initial
 * categories list as a prop from the server-rendered admin page, then
 * handles create/edit/delete against the /api/admin/blog/categories
 * endpoints. Reloads the page on success so the parent table reflects
 * the new state.
 */
export function BlogCategoryManager({
  categories: initial,
}: {
  categories: BlogCategoryRow[];
}) {
  const [editing, setEditing] = React.useState<BlogCategoryRow | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">
            Kategori{" "}
            <span className="text-ink-soft font-medium">
              ({initial.length})
            </span>
          </h3>
          <p className="text-xs text-ink-soft mt-0.5">
            Kelola kategori artikel. Hanya kategori dengan artikel terbit yang
            tampil di situs publik.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-navy hover:bg-navy-700 text-white"
          size="sm"
        >
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-surface-alt/50">
              <TableHead className="pl-4">Nama Kategori</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="hidden lg:table-cell">Deskripsi</TableHead>
              <TableHead className="text-center">Artikel</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Urutan</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-ink-soft text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Folder className="size-6 opacity-40" />
                    Belum ada kategori. Tambah yang pertama.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              initial.map((c) => (
                <CategoryRow key={c.id} row={c} onEdit={() => setEditing(c)} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryEditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        category={editing}
        mode="edit"
      />
      <CategoryEditDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        category={null}
        mode="create"
      />
    </div>
  );
}

function CategoryRow({
  row,
  onEdit,
}: {
  row: BlogCategoryRow;
  onEdit: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const [moving, setMoving] = React.useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Hapus kategori "${row.name}"? Artikel terkait tidak akan ikut terhapus, hanya kategori-nya yang dilepas.`
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/categories/${row.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menghapus.");
        return;
      }
      toast.success("Kategori dihapus.");
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setDeleting(false);
    }
  }

  async function move(delta: number) {
    setMoving(true);
    try {
      const res = await fetch(`/api/admin/blog/categories/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sortOrder: Math.max(0, row.sortOrder + delta),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal mengubah urutan.");
        return;
      }
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setMoving(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="font-medium text-ink">{row.name}</div>
        <div className="text-xs text-ink-soft md:hidden font-mono">/{row.slug}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="text-xs text-ink-soft font-mono">/{row.slug}</span>
      </TableCell>
      <TableCell className="hidden lg:table-cell max-w-xs">
        {row.description ? (
          <span className="line-clamp-2 text-xs text-ink-soft">
            {row.description}
          </span>
        ) : (
          <span className="text-xs text-ink-soft/60">—</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="bg-surface-alt text-ink-soft">
          {row.postCount}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-center">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => move(-1)}
            disabled={moving || row.sortOrder === 0}
            aria-label="Naik urutan"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => move(1)}
            disabled={moving}
            aria-label="Turun urutan"
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <span className="ml-1 text-xs text-ink-soft w-6 text-center tabular-nums">
            {row.sortOrder}
          </span>
        </div>
      </TableCell>
      <TableCell className="pr-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {row.postCount > 0 && (
            <a
              href={`/blog/category/${row.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center size-8 rounded-md text-ink-soft hover:text-navy hover:bg-surface-alt"
              aria-label="Lihat kategori di situs"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
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

function CategoryEditDialog({
  open,
  onOpenChange,
  category,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: BlogCategoryRow | null;
  mode: "edit" | "create";
}) {
  const [form, setForm] = React.useState<FormState>(emptyForm());
  const [saving, setSaving] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && category) {
      setForm(fromRow(category));
      setSlugTouched(true);
    } else {
      setForm(emptyForm());
      setSlugTouched(false);
    }
  }, [open, category, mode]);

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
      toast.error("Nama kategori wajib diisi.");
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
      description: form.description.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      const url =
        mode === "create"
          ? "/api/admin/blog/categories"
          : `/api/admin/blog/categories/${category?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan kategori.");
        return;
      }
      toast.success(
        mode === "create" ? "Kategori dibuat." : "Kategori diperbarui."
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-ink">
            {mode === "create" ? "Tambah Kategori Baru" : "Edit Kategori"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi detail kategori artikel."
              : "Perbarui kategori ini."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Field label="Nama Kategori" required>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Panduan Bisnis"
              disabled={saving}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Slug (URL)" required>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                placeholder="panduan-bisnis"
                disabled={saving}
                className="font-mono text-sm"
              />
            </Field>
            <Field label="Urutan Tampil">
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          <Field label="Deskripsi">
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Deskripsi singkat tentang kategori ini."
              disabled={saving}
              className="min-h-16 resize-y"
              maxLength={300}
            />
            <p className="text-[11px] text-ink-soft mt-1">
              Ditampilkan di halaman kategori jika diisi.
            </p>
          </Field>
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

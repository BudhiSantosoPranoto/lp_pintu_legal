"use client";

import * as React from "react";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
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

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: string;
};

function emptyForm(): FormState {
  return {
    question: "",
    answer: "",
    category: "Umum",
    isActive: true,
    sortOrder: "0",
  };
}

export function FaqsTable({
  faqs,
  existingCategories,
}: {
  faqs: FaqRow[];
  existingCategories: string[];
}) {
  const [editing, setEditing] = React.useState<FaqRow | null>(null);
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
          Tambah FAQ
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-surface-alt/50">
              <TableHead className="pl-4 w-10">#</TableHead>
              <TableHead>Pertanyaan</TableHead>
              <TableHead className="hidden md:table-cell">Kategori</TableHead>
              <TableHead className="text-center">Aktif</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-ink-soft text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <HelpCircle className="size-6 opacity-40" />
                    Belum ada FAQ. Tambahkan yang pertama.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((f) => (
                <FaqRowItem
                  key={f.id}
                  faq={f}
                  onEdit={() => setEditing(f)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FaqEditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        faq={editing}
        existingCategories={existingCategories}
        mode="edit"
      />
      <FaqEditDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        faq={null}
        existingCategories={existingCategories}
        mode="create"
      />
    </div>
  );
}

function FaqRowItem({
  faq,
  onEdit,
}: {
  faq: FaqRow;
  onEdit: () => void;
}) {
  const [isActive, setIsActive] = React.useState(faq.isActive);
  const [toggling, setToggling] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function toggleActive() {
    setToggling(true);
    const next = !isActive;
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
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
      toast.success(next ? "FAQ diaktifkan." : "FAQ dinonaktifkan.");
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus FAQ ini?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menghapus.");
        return;
      }
      toast.success("FAQ dihapus.");
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
          {faq.sortOrder}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium text-ink line-clamp-1 max-w-md">
          {faq.question}
        </div>
        <div className="text-xs text-ink-soft line-clamp-1 max-w-md">
          {faq.answer}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline" className="bg-surface-alt text-ink-soft">
          {faq.category}
        </Badge>
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

function FaqEditDialog({
  open,
  onOpenChange,
  faq,
  existingCategories,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: FaqRow | null;
  existingCategories: string[];
  mode: "edit" | "create";
}) {
  const [form, setForm] = React.useState<FormState>(emptyForm());
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && faq) {
      setForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isActive: faq.isActive,
        sortOrder: String(faq.sortOrder),
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, faq, mode]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.question.trim()) {
      toast.error("Pertanyaan wajib diisi.");
      return;
    }
    if (!form.answer.trim()) {
      toast.error("Jawaban wajib diisi.");
      return;
    }
    setSaving(true);
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim() || "Umum",
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      const url = mode === "create" ? "/api/admin/faqs" : `/api/admin/faqs/${faq?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan FAQ.");
        return;
      }
      toast.success(mode === "create" ? "FAQ ditambahkan." : "FAQ diperbarui.");
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
            {mode === "create" ? "Tambah FAQ" : "Edit FAQ"}
          </DialogTitle>
          <DialogDescription>
            FAQ akan tampil di halaman /faq jika berstatus aktif.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Field label="Pertanyaan" required>
            <Input
              value={form.question}
              onChange={(e) => update("question", e.target.value)}
              placeholder="Apa yang dibutuhkan untuk mendirikan PT?"
              disabled={saving}
            />
          </Field>

          <Field label="Jawaban" required>
            <Textarea
              value={form.answer}
              onChange={(e) => update("answer", e.target.value)}
              placeholder="Jawaban lengkap dan jelas…"
              disabled={saving}
              className="min-h-28 resize-y"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Kategori">
              <Input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                list="faq-categories"
                disabled={saving}
              />
              <datalist id="faq-categories">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Urutan">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", e.target.value)}
                disabled={saving}
              />
            </Field>
            <div className="flex items-end gap-2 pb-1.5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => update("isActive", v)}
                  disabled={saving}
                />
                <span className="text-sm font-medium text-ink">Aktif</span>
              </label>
            </div>
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

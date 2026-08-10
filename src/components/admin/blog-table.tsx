"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  Newspaper,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  status: string; // DRAFT | PUBLISHED
  categoryId: string;
  categoryName: string | null;
  publishedAt: string | null;
  createdAt: string;
  tags: string; // comma-separated lowercase tags (raw DB column value)
};

type CategoryOption = { id: string; name: string; slug: string };

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  status: "DRAFT" | "PUBLISHED";
  categoryId: string;
  publishedAt: string; // yyyy-mm-dd or ""
  tags: string; // raw comma-separated input — normalized on save
};

function emptyForm(): FormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    authorName: "Tim Pintu Legal",
    status: "DRAFT",
    categoryId: "",
    publishedAt: "",
    tags: "",
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

/** Parse the comma-separated tag input into clean lowercase tokens for
 *  display. Mirrors `parseTags()` from src/data/queries.ts but inlined
 *  here so the admin client doesn't import server-side code paths. */
function parseTagsLocal(raw: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(",")) {
    const tag = piece.trim().toLowerCase().slice(0, 30);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "d MMM yyyy", { locale: idLocale });
  } catch {
    return iso;
  }
}

export function BlogTable({
  posts,
  categories,
}: {
  posts: BlogRow[];
  categories: CategoryOption[];
}) {
  const [editing, setEditing] = React.useState<BlogRow | null>(null);
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
          Tulis Artikel
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-surface-alt/50">
              <TableHead className="pl-4">Judul</TableHead>
              <TableHead className="hidden md:table-cell">Kategori</TableHead>
              <TableHead className="hidden lg:table-cell">Tag</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Terbit</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-ink-soft text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Newspaper className="size-6 opacity-40" />
                    Belum ada artikel. Tulis yang pertama.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((p) => (
                <BlogRowItem key={p.id} post={p} onEdit={() => setEditing(p)} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BlogEditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        post={editing}
        categories={categories}
        mode="edit"
      />
      <BlogEditDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        post={null}
        categories={categories}
        mode="create"
      />
    </div>
  );
}

function BlogRowItem({
  post,
  onEdit,
}: {
  post: BlogRow;
  onEdit: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);

  async function toggleStatus() {
    const next = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: next,
          publishedAt:
            next === "PUBLISHED"
              ? post.publishedAt ?? new Date().toISOString()
              : post.publishedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal mengubah status.");
        return;
      }
      toast.success(next === "PUBLISHED" ? "Artikel diterbitkan." : "Artikel dijadikan draft.");
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan.");
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus artikel "${post.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menghapus.");
        return;
      }
      toast.success("Artikel dihapus.");
      window.location.reload();
    } catch {
      toast.error("Kesalahan jaringan.");
    } finally {
      setDeleting(false);
    }
  }

  const published = post.status === "PUBLISHED";

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="font-medium text-ink line-clamp-1 max-w-md">{post.title}</div>
        <div className="text-xs text-ink-soft font-mono">/{post.slug}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {post.categoryName ? (
          <Badge variant="outline" className="bg-surface-alt text-ink-soft">
            {post.categoryName}
          </Badge>
        ) : (
          <span className="text-xs text-ink-soft">—</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <TagsCell tags={post.tags} />
      </TableCell>
      <TableCell className="text-center">
        <Badge
          variant="outline"
          className={
            published
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-surface-alt text-ink-soft border-border"
          }
        >
          {published ? "Terbit" : "Draft"}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-xs text-ink-soft">
        {formatDate(post.publishedAt)}
      </TableCell>
      <TableCell className="pr-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {published && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center size-8 rounded-md text-ink-soft hover:text-navy hover:bg-surface-alt"
              aria-label="Lihat di situs"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={toggleStatus}
            aria-label={published ? "Jadikan draft" : "Terbitkan"}
          >
            {published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
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

function BlogEditDialog({
  open,
  onOpenChange,
  post,
  categories,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: BlogRow | null;
  categories: CategoryOption[];
  mode: "edit" | "create";
}) {
  const [form, setForm] = React.useState<FormState>(emptyForm());
  const [saving, setSaving] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && post) {
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        authorName: post.authorName,
        status: post.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        categoryId: post.categoryId,
        publishedAt: post.publishedAt
          ? post.publishedAt.slice(0, 10)
          : "",
        tags: post.tags ?? "",
      });
      setSlugTouched(true);
    } else {
      setForm(emptyForm());
      setSlugTouched(false);
    }
  }, [open, post, mode]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !slugTouched) {
        next.slug = slugify(value as string);
      }
      if (key === "slug") setSlugTouched(true);
      return next;
    });
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Judul wajib diisi.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug wajib diisi.");
      return;
    }
    if (!form.excerpt.trim()) {
      toast.error("Ringkasan (excerpt) wajib diisi.");
      return;
    }
    setSaving(true);
    // Normalize tags to lowercase, trimmed, 30-char, deduplicated,
    // comma-joined. Mirrors normalizeTagsInput() on the server.
    const normalizedTags = parseTagsLocal(form.tags).join(",");
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      excerpt: form.excerpt.trim(),
      content: form.content,
      authorName: form.authorName.trim() || "Tim Pintu Legal",
      status: form.status,
      categoryId: form.categoryId || null,
      tags: normalizedTags,
      publishedAt:
        form.status === "PUBLISHED"
          ? form.publishedAt
            ? new Date(form.publishedAt).toISOString()
            : new Date().toISOString()
          : form.publishedAt
            ? new Date(form.publishedAt).toISOString()
            : null,
    };
    try {
      const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${post?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Gagal menyimpan artikel.");
        return;
      }
      toast.success(mode === "create" ? "Artikel dibuat." : "Artikel diperbarui.");
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
            {mode === "create" ? "Tulis Artikel Baru" : "Edit Artikel"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi detail artikel. Konten mendukung format markdown sederhana."
              : "Perbarui artikel ini."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Field label="Judul" required>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Pendirian PT vs CV"
              disabled={saving}
            />
          </Field>

          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Slug (URL)" required>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                placeholder="pendirian-pt-vs-cv"
                disabled={saving}
                className="font-mono text-sm"
              />
            </Field>
            <Field label="Penulis">
              <Input
                value={form.authorName}
                onChange={(e) => update("authorName", e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          <Field label="Ringkasan (Excerpt)" required>
            <Textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="Satu-dua kalimat ringkasan untuk kartu artikel."
              disabled={saving}
              className="min-h-16 resize-y"
              maxLength={300}
            />
          </Field>

          <Field label="Konten (Markdown)">
            <Textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder={"# Judul\n\nParagraf pembuka...\n\n- poin 1\n- poin 2"}
              disabled={saving}
              className="min-h-48 resize-y font-mono text-sm"
            />
          </Field>

          <Field label="Tag">
            <Input
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="pt, nib, pendirian, panduan"
              disabled={saving}
              className="text-sm"
            />
            <p className="text-[11px] text-ink-soft">
              Pisahkan dengan koma. Otomatis diubah ke huruf kecil. Maksimal 30
              karakter per tag.
            </p>
            {/* Live preview of the normalized tags so the admin can see how
                they'll appear on the public blog card before saving. */}
            {parseTagsLocal(form.tags).length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {parseTagsLocal(form.tags).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-600 ring-1 ring-gold-100"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
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
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) =>
                  update("status", v as "DRAFT" | "PUBLISHED")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Terbit</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tanggal Terbit">
              <Input
                type="date"
                value={form.publishedAt}
                onChange={(e) => update("publishedAt", e.target.value)}
                disabled={saving}
              />
            </Field>
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

/**
 * Renders the comma-separated `tags` column as small badges in the admin
 * table. Shows up to 3 badges + an "+N" overflow chip when there are more.
 * Falls back to "—" when the post has no tags.
 */
function TagsCell({ tags }: { tags: string }) {
  const list = parseTagsLocal(tags);
  if (list.length === 0) {
    return <span className="text-xs text-ink-soft">—</span>;
  }
  const visible = list.slice(0, 3);
  const overflow = list.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-600 ring-1 ring-gold-100"
        >
          #{t}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-ink-soft">
          +{overflow}
        </span>
      )}
    </div>
  );
}

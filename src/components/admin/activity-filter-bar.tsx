"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Canonical action keys offered in the filter dropdown. */
export const ACTIVITY_ACTIONS: { value: string; label: string }[] = [
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "LEAD_STATUS_UPDATE", label: "Update Status Lead" },
  { value: "LEAD_DELETE", label: "Hapus Lead" },
  { value: "LEAD_BULK_UPDATE", label: "Update Massal Lead" },
  { value: "LEAD_BULK_DELETE", label: "Hapus Massal Lead" },
  { value: "BLOG_CREATE", label: "Buat Artikel" },
  { value: "BLOG_UPDATE", label: "Perbarui Artikel" },
  { value: "BLOG_DELETE", label: "Hapus Artikel" },
  { value: "SERVICE_CREATE", label: "Buat Layanan" },
  { value: "SERVICE_UPDATE", label: "Perbarui Layanan" },
  { value: "SERVICE_DELETE", label: "Hapus Layanan" },
];

/**
 * Filter bar for the activity log. Reads the current URL search params
 * (`action`, `email`, `page`) and pushes new values on submit, which causes
 * the parent server component to re-fetch with the new filters.
 *
 * The "Semua" option for the action filter uses the sentinel value `"all"`,
 * which we translate to an empty string before pushing the URL (so the
 * absence of the param = "no filter").
 */
export function ActivityFilterBar({
  initialAction,
  initialEmail,
}: {
  initialAction: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  // Local input state for the email search box — initialised from the URL
  // so the field shows the active filter after a server-side re-render.
  const [emailInput, setEmailInput] = React.useState(initialEmail);
  const [actionInput, setActionInput] = React.useState(initialAction || "all");

  // Keep local state in sync if the URL changes from elsewhere (e.g. the
  // pagination links clearing `page` but keeping filters).
  React.useEffect(() => {
    setEmailInput(initialEmail);
    setActionInput(initialAction || "all");
  }, [initialEmail, initialAction]);

  function buildHref(action: string, email: string): string {
    const next = new URLSearchParams(params.toString());
    if (action && action !== "all") next.set("action", action);
    else next.delete("action");
    if (email.trim()) next.set("email", email.trim().toLowerCase());
    else next.delete("email");
    // Reset to page 1 whenever filters change — otherwise we might land on a
    // page that no longer exists after narrowing the result set.
    next.delete("page");
    const qs = next.toString();
    return qs ? `/admin/aktivitas?${qs}` : "/admin/aktivitas";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildHref(actionInput, emailInput));
  }

  function onClear() {
    setEmailInput("");
    setActionInput("all");
    router.push("/admin/aktivitas");
  }

  const hasFilter = !!initialAction || !!initialEmail;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3"
      aria-label="Filter aktivitas"
    >
      <div className="flex-1 min-w-0">
        <label
          htmlFor="activity-action-filter"
          className="block text-xs font-medium text-ink-soft mb-1.5"
        >
          Jenis Aksi
        </label>
        <Select value={actionInput} onValueChange={setActionInput}>
          <SelectTrigger
            id="activity-action-filter"
            className="w-full"
            aria-label="Filter jenis aksi"
          >
            <span className="inline-flex items-center gap-2">
              <Filter className="size-3.5 text-ink-soft" />
              <SelectValue placeholder="Semua aksi" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua aksi</SelectItem>
            {ACTIVITY_ACTIONS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-0">
        <label
          htmlFor="activity-email-filter"
          className="block text-xs font-medium text-ink-soft mb-1.5"
        >
          Email Admin
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft pointer-events-none" />
          <Input
            id="activity-email-filter"
            type="search"
            placeholder="Cari email admin…"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="pl-9"
            aria-label="Cari email admin"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" className="bg-navy hover:bg-navy-700 text-white">
          Terapkan
        </Button>
        {hasFilter && (
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            aria-label="Hapus filter"
          >
            <X className="size-4" />
            <span className="sr-only">Hapus filter</span>
          </Button>
        )}
      </div>
    </form>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Send, Zap, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ConsultationServiceOption } from "./consultation-form";

const quickSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(120),
  phone: z
    .string()
    .min(7, "Nomor WhatsApp minimal 7 digit")
    .max(25)
    .regex(/^[0-9+\-\s]+$/, "Hanya boleh berisi angka, spasi, +, atau -"),
  message: z.string().min(5, "Pesan minimal 5 karakter").max(2000),
});

type QuickFormValues = z.infer<typeof quickSchema>;

/**
 * Quick consultation form — A/B variant with only 3 fields (name, phone, message).
 * Designed for higher conversion by reducing friction.
 * Submits to the same /api/leads endpoint with source "WEBSITE_QUICK".
 */
export function QuickConsultationForm({
  services,
}: {
  services: ConsultationServiceOption[];
}) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle");

  const form = useForm<QuickFormValues>({
    resolver: zodResolver(quickSchema),
    defaultValues: { name: "", phone: "", message: "" },
  });

  const onSubmit = async (values: QuickFormValues) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          email: "",
          serviceId: "",
          businessName: "",
          // Honeypot
          website: "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          toast.error("Terlalu banyak permintaan. Coba lagi nanti.");
        } else {
          toast.error(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
        }
        setStatus("idle");
        return;
      }

      setStatus("success");
      toast.success("Pesan terkirim! Tim kami akan menghubungi Anda.");
      form.reset();
    } catch {
      toast.error("Koneksi gagal. Periksa internet Anda dan coba lagi.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <p className="text-lg font-semibold text-emerald-900">Pesan terkirim!</p>
          <p className="mt-1 text-sm text-emerald-700">
            Terima kasih. Tim Pintu Legal akan menghubungi Anda melalui WhatsApp.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setStatus("idle")}
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
        >
          Kirim pesan lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="flex items-center gap-2 rounded-xl bg-gold-50 p-3 text-xs text-gold-700 ring-1 ring-gold-200">
        <Zap className="h-4 w-4 shrink-0" />
        <span>Form cepat — cukup 3 isian, tim kami akan membantu sisanya.</span>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="quick-name" className="text-sm font-medium text-navy">
          Nama <span className="text-red-500">*</span>
        </Label>
        <Input
          id="quick-name"
          {...form.register("name")}
          placeholder="Nama lengkap Anda"
          className="h-11"
          aria-invalid={!!form.formState.errors.name}
        />
        {form.formState.errors.name && (
          <p role="alert" className="text-xs text-red-600">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="quick-phone" className="text-sm font-medium text-navy">
          Nomor WhatsApp <span className="text-red-500">*</span>
        </Label>
        <Input
          id="quick-phone"
          type="tel"
          {...form.register("phone")}
          placeholder="08xxxxxxxxxx"
          className="h-11"
          aria-invalid={!!form.formState.errors.phone}
        />
        {form.formState.errors.phone && (
          <p role="alert" className="text-xs text-red-600">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="quick-message" className="text-sm font-medium text-navy">
          Kebutuhan Anda <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="quick-message"
          {...form.register("message")}
          placeholder="Ceritakan kebutuhan legalitas bisnis Anda secara singkat."
          className="min-h-[80px] resize-none"
          aria-invalid={!!form.formState.errors.message}
        />
        {form.formState.errors.message && (
          <p role="alert" className="text-xs text-red-600">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      {/* Honeypot */}
      <input
        type="text"
        {...form.register("website" as never)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-12 w-full bg-navy text-white hover:bg-navy-700"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Mengirim…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Kirim Konsultasi
          </>
        )}
      </Button>

      <p className="text-center text-xs text-ink-soft">
        Dengan mengirim, Anda menyetujui{" "}
        <a href="/privacy-policy" className="font-medium text-gold-600 hover:underline">
          Kebijakan Privasi
        </a>{" "}
        kami.
      </p>
    </form>
  );
}

/**
 * Toggle between full form and quick form.
 */
export function FormVariantToggle({
  variant,
  onChange,
}: {
  variant: "full" | "quick";
  onChange: (v: "full" | "quick") => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-surface-alt p-1">
      <button
        type="button"
        onClick={() => onChange("quick")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
          variant === "quick"
            ? "bg-navy text-white shadow-soft"
            : "text-ink-soft hover:text-navy"
        )}
      >
        <Zap className="h-3.5 w-3.5" />
        Cepat
      </button>
      <button
        type="button"
        onClick={() => onChange("full")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
          variant === "full"
            ? "bg-navy text-white shadow-soft"
            : "text-ink-soft hover:text-navy"
        )}
      >
        <FileText className="h-3.5 w-3.5" />
        Lengkap
      </button>
    </div>
  );
}

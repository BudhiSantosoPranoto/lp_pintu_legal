"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ConsultationServiceOption = { id: string; name: string };

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(120),
  phone: z
    .string()
    .min(7, "Nomor WhatsApp minimal 7 digit")
    .max(25, "Nomor WhatsApp terlalu panjang")
    .regex(/^[0-9+\-\s]+$/, "Hanya boleh berisi angka, spasi, +, atau -"),
  email: z
    .string()
    .max(120)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Format email tidak valid",
    }),
  serviceId: z.string().optional().or(z.literal("")),
  businessName: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(5, "Pesan minimal 5 karakter").max(2000),
  website: z.string().optional().or(z.literal("")), // honeypot
});

type FormValues = z.infer<typeof formSchema>;

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export function ConsultationForm({
  services,
}: {
  services: ConsultationServiceOption[];
}) {
  const [submit, setSubmit] = React.useState<SubmitState>({ status: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      serviceId: "",
      businessName: "",
      message: "",
      website: "",
    },
    mode: "onTouched",
  });

  const serviceIdValue = useWatch({ control, name: "serviceId" });

  const onSubmit = async (values: FormValues) => {
    setSubmit({ status: "loading" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      // honeypot / success
      if (res.ok) {
        setSubmit({ status: "success" });
        reset();
        toast.success("Pesan terkirim!", {
          description: "Tim Pintu Legal akan menghubungi Anda segera.",
        });
        return;
      }

      // rate-limited
      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        const msg =
          (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : null) ?? "Terlalu banyak permintaan. Coba lagi nanti.";
        setSubmit({ status: "error", message: msg });
        toast.error("Batas permintaan tercapai", { description: msg });
        return;
      }

      // validation errors
      if (res.status === 422 || res.status === 400) {
        const data = await res.json().catch(() => null);
        const msg =
          (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : null) ?? "Periksa kembali isian Anda.";
        setSubmit({ status: "error", message: msg });
        toast.error("Validasi gagal", { description: msg });
        return;
      }

      const data = await res.json().catch(() => null);
      const msg =
        (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : null) ?? "Terjadi kesalahan. Silakan coba lagi.";
      setSubmit({ status: "error", message: msg });
      toast.error("Gagal mengirim", { description: msg });
    } catch {
      setSubmit({
        status: "error",
        message: "Koneksi gagal. Periksa internet Anda lalu coba lagi.",
      });
      toast.error("Koneksi gagal", {
        description: "Periksa internet Anda lalu coba lagi.",
      });
    }
  };

  // ─── Success state ─────────────────────────────────────────────
  if (submit.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/60 p-8 text-center sm:p-10"
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-navy">
          Pesan terkirim!
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          Terima kasih telah menghubungi Pintu Legal. Tim kami akan menghubungi
          Anda melalui WhatsApp atau email secepatnya.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 border-navy/20 text-navy hover:bg-navy-50"
          onClick={() => setSubmit({ status: "idle" })}
        >
          Kirim pesan lain
        </Button>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Form konsultasi gratis"
      className="space-y-5"
    >
      {submit.status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submit.message}</span>
        </div>
      )}

      {/* Honeypot (visually hidden, not display:none — bots still fill it) */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website-hp">Jangan isi</label>
        <input
          id="website-hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Nama"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Nama lengkap Anda"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
        </Field>

        <Field
          id="phone"
          label="Nomor WhatsApp"
          required
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            inputMode="tel"
            placeholder="08xxxxxxxxxx"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            {...register("phone")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="email"
          label="Email"
          hint="Opsional"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <Field
          id="businessName"
          label="Nama Usaha"
          hint="Opsional"
          error={errors.businessName?.message}
        >
          <Input
            id="businessName"
            placeholder="Nama perusahaan/usaha"
            autoComplete="organization"
            aria-invalid={!!errors.businessName}
            aria-describedby={errors.businessName ? "businessName-error" : undefined}
            {...register("businessName")}
          />
        </Field>
      </div>

      <Field
        id="serviceId"
        label="Jenis Layanan"
        hint="Pilih jika sudah tahu"
        error={errors.serviceId?.message}
      >
        <input
          type="hidden"
          {...register("serviceId")}
          value={serviceIdValue ?? ""}
        />
        <Select
          value={serviceIdValue ?? ""}
          onValueChange={(v) => setValue("serviceId", v, { shouldValidate: true })}
        >
          <SelectTrigger
            id="serviceId"
            className="h-11 w-full"
            aria-label="Jenis layanan"
          >
            <SelectValue placeholder="— Pilih —" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        id="message"
        label="Pesan / Kebutuhan"
        required
        error={errors.message?.message}
      >
        <Textarea
          id="message"
          rows={5}
          placeholder="Ceritakan kebutuhan legalitas bisnis Anda secara singkat."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
      </Field>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-soft">
          Dengan mengirim, Anda menyetujui pemrosesan data sesuai{" "}
          <a
            href="/privacy-policy"
            className="font-medium text-navy underline-offset-2 hover:underline"
          >
            Kebijakan Privasi
          </a>
          .
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={submit.status === "loading"}
          className="bg-navy text-white hover:bg-navy-700 sm:w-auto"
        >
          {submit.status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Kirim Pesan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────
function Field({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-navy">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {hint && (
          <span className="text-[11px] text-ink-soft/80">{hint}</span>
        )}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className={cn("text-xs font-medium text-destructive")}
        >
          {error}
        </p>
      ) : (
        <p className="h-[1px]" aria-hidden />
      )}
    </div>
  );
}

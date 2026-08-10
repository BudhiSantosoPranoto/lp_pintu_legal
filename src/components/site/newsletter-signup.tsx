"use client";

import * as React from "react";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
});

/**
 * Newsletter signup form. Submits to /api/leads with source "NEWSLETTER"
 * and a marker message so admin can distinguish newsletter signups.
 */
export function NewsletterSignup({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Email tidak valid");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          phone: "0000000000",
          email: parsed.data.email,
          message: `[NEWSLETTER] Berlangganan newsletter Pintu Legal dengan email ${parsed.data.email}`,
        }),
      });
      if (!res.ok) throw new Error("Gagal");
      setStatus("success");
      toast.success("Berhasil berlangganan! Terima kasih.");
      setEmail("");
    } catch {
      setStatus("idle");
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    }
  }

  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8"
          : "rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8"
      }
    >
      <div className="flex items-center gap-3">
        <span
          className={
            isDark
              ? "grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30"
              : "grid h-11 w-11 place-items-center rounded-xl bg-navy-50 text-navy ring-1 ring-navy-100"
          }
        >
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h3 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-navy"}>
            Tetap update dengan panduan legalitas
          </h3>
          <p className={isDark ? "text-sm text-white/60" : "text-sm text-ink-soft"}>
            Dapatkan artikel dan tips legalitas bisnis terbaru.
          </p>
        </div>
      </div>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700 ring-1 ring-emerald-200"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Berhasil berlangganan!</p>
            <p className="text-xs text-emerald-600">Kami akan mengirim update terbaru ke email Anda.</p>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="email@anda.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={
              isDark
                ? "h-12 flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/40"
                : "h-12 flex-1"
            }
            aria-label="Email untuk berlangganan"
            required
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className={
              isDark
                ? "h-12 bg-gold text-navy hover:bg-gold-400"
                : "h-12 bg-navy text-white hover:bg-navy-700"
            }
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Berlangganan
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      <p className={isDark ? "mt-3 text-xs text-white/40" : "mt-3 text-xs text-ink-soft/70"}>
        Kami menghormati privasi Anda. Berhenti berlangganan kapan saja.
      </p>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const router = useRouter();
  const sp = React.use(searchParams);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Email atau kata sandi salah.");
        setLoading(false);
        return;
      }
      toast.success("Berhasil masuk. Mengarahkan…");
      const from = typeof sp.from === "string" && sp.from.startsWith("/")
        ? sp.from
        : "/admin";
      // Use a hard navigation so middleware re-evaluates the new cookie.
      window.location.href = from;
    } catch {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-navy-mesh relative flex items-center justify-center px-4 py-10">
      {/* Decorative grid overlay */}
      <div className="absolute inset-0 bg-grid-navy opacity-40 pointer-events-none" />
      {/* Gold radial glow */}
      <div
        aria-hidden
        className="absolute -top-32 right-1/4 h-72 w-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(200,155,60,0.35), transparent 70%)" }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gold/15 ring-1 ring-gold/30 backdrop-blur-sm mb-4">
            <ShieldCheck className="size-7 text-gold" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            PINTU LEGAL <span className="text-gold">Admin</span>
          </h1>
          <p className="text-white/60 text-sm mt-1.5">
            Masuk untuk mengelola leads, layanan, dan konten situs.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft-lg border border-white/10 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-ink font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@pintulegal.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-ink font-medium">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-ink-soft hover:text-ink hover:bg-surface-alt transition-colors"
                  aria-label={showPw ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-11 bg-navy hover:bg-navy-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Memproses…
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Akses terbatas untuk administrator. Hubungi pengelola situs jika Anda
          lupa kredensial.
        </p>
      </div>
    </div>
  );
}

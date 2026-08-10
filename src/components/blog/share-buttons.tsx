"use client";

import * as React from "react";
import { Share2, Link2, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Social share row for blog articles.
 *
 * - WhatsApp: opens wa.me with a prefilled share message built via waLink.
 * - Copy Link: copies the current URL to clipboard, shows a sonner toast.
 * - Native share: rendered only when `navigator.share` is available
 *   (detected on mount to avoid SSR hydration mismatch).
 *
 * The `url` prop is the canonical article URL (server-built) and is used
 * for the WhatsApp link so it stays stable across SSR/CSR. Copy + native
 * share read `window.location.href` at click time so users always copy
 * exactly what they see in the address bar.
 */
export function ShareButtons({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
    );
  }, []);

  const waUrl = waLink(`Halo, saya ingin membagikan artikel ini: ${url}`);

  const handleCopy = async () => {
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : url;
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        // Legacy fallback for older browsers / non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = currentUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success("Tersalin!", {
        description: "Tautan artikel telah disalin ke papan klip.",
      });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Gagal menyalin", {
        description: "Silakan salin tautan secara manual dari address bar.",
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({
        title,
        text: title,
        url: typeof window !== "undefined" ? window.location.href : url,
      });
    } catch {
      // user dismissed the share sheet — no-op
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className
      )}
    >
      <span className="mr-1 text-sm font-medium text-ink-soft">
        Bagikan artikel
      </span>

      {/* WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan artikel ke WhatsApp"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-green-600 px-3.5 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Salin tautan artikel"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2"
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden />
        )}
        {copied ? "Tersalin!" : "Salin Tautan"}
      </button>

      {/* Native share — only when available */}
      {canShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Bagikan artikel"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-sm font-medium text-navy shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Bagikan
        </button>
      )}
    </div>
  );
}

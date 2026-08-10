"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { siteConfig, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp button with expandable tooltip card.
 * Position: bottom-right; respects safe-area on mobile; never overlaps CTA.
 */
export function FloatingWhatsApp() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const message = "Halo Pintu Legal, saya ingin berkonsultasi mengenai legalitas bisnis.";
  const href = waLink(message);

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-[280px] overflow-hidden rounded-2xl bg-white shadow-soft-lg ring-1 ring-border"
          >
            <div className="bg-[#075E54] px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Pintu Legal</p>
                    <p className="text-[11px] text-white/70">Biasanya membalas dalam beberapa menit</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Tutup"
                  className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#ECE5DD] px-4 py-4">
              <div className="rounded-xl rounded-tl-sm bg-white p-3 text-sm text-ink shadow-sm">
                <p className="font-medium text-navy">Halo! 👋</p>
                <p className="mt-1 text-ink-soft">
                  Ada yang bisa kami bantu seputar legalitas bisnis Anda? Kirim pesan untuk konsultasi gratis.
                </p>
                <span className="mt-1.5 block text-[10px] text-ink-soft/60">Tim Pintu Legal</span>
              </div>

              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
              >
                <MessageCircle className="h-4 w-4" />
                Mulai Chat
              </a>
              <p className="mt-2 text-center text-[10px] text-ink-soft/70">
                Kontak: {siteConfig.whatsappDisplay}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup chat WhatsApp" : "Buka chat WhatsApp"}
        className={cn(
          "group relative grid h-14 w-14 place-items-center rounded-full shadow-soft-lg transition-transform hover:scale-105 active:scale-95",
          "bg-[#25D366] text-white"
        )}
      >
        <span className="absolute inset-0 rounded-full animate-pulse-ring" aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="wa"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* WhatsApp glyph */}
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                <path d="M19.05 4.94A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.13a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.81.83-3.04-.2-.31a8.18 8.18 0 0 1-1.25-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.41-.55-.42l-.47-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z"/>
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

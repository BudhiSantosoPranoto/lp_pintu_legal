"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { siteConfig, waLink } from "@/lib/site";

/**
 * Animated content for the 404 page. Kept as a client component so the root
 * `not-found.tsx` can stay a server component.
 *
 * Visual: full-height navy-mesh panel with subtle grid overlay, decorative
 * gold double-door SVG (PINTU LEGAL logo concept), oversized "404" in gold
 * gradient, headline + subtext in white, and two CTAs (gold primary, white
 * outline).
 *
 * Animation: fade + slide-up entrance. Respects `prefers-reduced-motion`.
 */
export function NotFoundContent() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0.001 }
        : { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0.001 }
        : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center overflow-hidden bg-navy-mesh py-20 sm:py-24"
      aria-label="Halaman tidak ditemukan"
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-navy opacity-60"
        aria-hidden
      />
      {/* Gold radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(200,155,60,0.22) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="container-px relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center"
      >
        {/* Decorative double-door SVG in gold */}
        <motion.div variants={item} className="mb-8" aria-hidden>
          <svg
            viewBox="0 0 100 100"
            className="h-20 w-20 sm:h-24 sm:w-24"
            role="presentation"
          >
            <g fill="none" stroke="#C89B3C" strokeWidth="2.4" strokeLinejoin="round">
              {/* Left arched panel */}
              <path d="M22 82 L22 40 Q22 18 44 18 L48 18 L48 82 Z" />
              {/* Right arched panel */}
              <path d="M78 82 L78 40 Q78 18 56 18 L52 18 L52 82 Z" />
              {/* Top arch connector (the upper arch curve) */}
              <path d="M22 40 Q22 18 44 18 Q50 14 56 18 Q78 18 78 40" />
            </g>
            {/* Gold knobs */}
            <circle cx="44" cy="52" r="3" fill="#C89B3C" />
            <circle cx="56" cy="52" r="3" fill="#C89B3C" />
            {/* Gold threshold */}
            <rect x="16" y="82" width="68" height="4" rx="2" fill="#C89B3C" />
          </svg>
        </motion.div>

        <motion.p
          variants={item}
          className="eyebrow text-gold-400"
        >
          ERROR 404
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-3 text-gradient-gold text-8xl font-extrabold leading-none tracking-tight sm:text-9xl"
        >
          404
        </motion.h1>

        <motion.h2
          variants={item}
          className="mt-4 text-2xl font-bold text-white sm:text-3xl"
        >
          Halaman tidak ditemukan
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base"
        >
          Maaf, halaman yang Anda cari mungkin telah dipindahkan atau tidak
          tersedia.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-3"
        >
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-sm font-semibold text-navy shadow-gold transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/kontak"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/0 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <MessageCircle className="h-4 w-4" />
            Hubungi Kami
          </Link>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-8 text-xs text-white/50"
        >
          Atau chat langsung via WhatsApp:{" "}
          <a
            href={waLink("Halo Pintu Legal, saya menemukan halaman yang tidak ditemukan dan butuh bantuan.")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold-400 underline-offset-2 hover:underline"
          >
            {siteConfig.whatsappDisplay}
          </a>
        </motion.p>
      </motion.div>
    </section>
  );
}

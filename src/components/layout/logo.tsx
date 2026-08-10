import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
  /** Use light text (for navy/dark backgrounds) */
  inverted?: boolean;
}

/**
 * PINTU LEGAL official logo.
 *
 * Uses the official brand assets:
 * - Full logo (door icon + "PINTU" + "LEGAL" wordmark): /images/pintu-legal-logo.png
 * - Door icon only (for favicon / compact display): /images/pintu-legal-icon.png
 *
 * Original aspect ratios are preserved — no stretching, cropping, or distortion.
 * Full logo: 1536×1024 (1.5:1 landscape)
 * Icon: 1440×1440 (1:1 square)
 */
export function Logo({ className, variant = "full", inverted: _inverted }: LogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/images/pintu-legal-icon.png"
        alt="Pintu Legal"
        width={40}
        height={40}
        className={cn("h-9 w-9 object-contain", className)}
        priority
      />
    );
  }
  return (
    <Image
      src="/images/pintu-legal-logo.png"
      alt="Pintu Legal — Membuka Jalan Menuju Bisnis yang Legal"
      width={180}
      height={120}
      className={cn("h-9 w-auto object-contain sm:h-10", className)}
      priority
    />
  );
}

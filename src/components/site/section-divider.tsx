import { cn } from "@/lib/utils";

/**
 * Decorative section divider — a subtle door-arch SVG that creates
 * a premium visual transition between sections.
 * Variants: "light" (for white→gray transitions) and "dark" (for navy sections).
 */
export function SectionDivider({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark" | "gold";
  className?: string;
}) {
  const color =
    variant === "dark" ? "#0F2747" : variant === "gold" ? "#C89B3C" : "#F7F8FA";

  return (
    <div
      className={cn(
        "pointer-events-none flex justify-center overflow-hidden",
        variant === "dark" ? "py-8" : "py-6",
        className
      )}
      aria-hidden
    >
      <svg
        width="180"
        height="40"
        viewBox="0 0 180 40"
        fill="none"
        className="opacity-[0.15]"
      >
        {/* Left line */}
        <line
          x1="0"
          y1="20"
          x2="60"
          y2="20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Center door arch */}
        <path
          d="M75 35 L75 18 Q75 8 90 8 L90 35 Z"
          fill={color}
        />
        <path
          d="M90 35 L90 18 Q90 8 105 35 L105 35 Z"
          fill={color}
        />
        <circle cx="84" cy="22" r="2" fill="#C89B3C" />
        <circle cx="96" cy="22" r="2" fill="#C89B3C" />
        {/* Right line */}
        <line
          x1="120"
          y1="20"
          x2="180"
          y2="20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a contact value that may be an unconfigured placeholder
 * (e.g. "[Nomor WhatsApp]"). Per the master prompt, we MUST NOT invent
 * business data — so placeholders stay as placeholders, but are styled
 * elegantly with a "belum dikonfigurasi" treatment instead of raw brackets.
 */
export function ContactValue({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const isPlaceholder = value.startsWith("[") && value.endsWith("]");

  if (isPlaceholder) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-xs italic text-white/40 ring-1 ring-dashed ring-white/15",
          className
        )}
        title="Nilai ini dapat dikonfigurasi melalui panel admin"
      >
        <Settings className="h-3 w-3" />
        Belum dikonfigurasi
      </span>
    );
  }

  return <span className={className}>{value}</span>;
}

"use client";

import * as React from "react";
import { ConsultationForm } from "./consultation-form";
import { QuickConsultationForm, FormVariantToggle } from "./quick-consultation-form";
import type { ConsultationServiceOption } from "./consultation-form";

const STORAGE_KEY = "pintu_form_variant";

/**
 * Wrapper that manages A/B form variant toggle.
 * Persists the user's choice in localStorage.
 * Defaults to "full" form for comprehensive data collection.
 */
export function ConsultationFormWrapper({
  services,
}: {
  services: ConsultationServiceOption[];
}) {
  const [variant, setVariant] = React.useState<"full" | "quick">("full");

  // Load preference from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "quick" || stored === "full") {
        setVariant(stored);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleChange = React.useCallback((v: "full" | "quick") => {
    setVariant(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Form Konsultasi
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {variant === "full"
              ? "Lengkapi form di bawah ini. Tim kami akan menghubungi Anda dalam jam kerja."
              : "Cukup isi 3 isian singkat. Tim kami akan membantu detail selanjutnya."}
          </p>
        </div>
        <FormVariantToggle variant={variant} onChange={handleChange} />
      </div>

      {variant === "full" ? (
        <ConsultationForm services={services} />
      ) : (
        <QuickConsultationForm services={services} />
      )}
    </div>
  );
}

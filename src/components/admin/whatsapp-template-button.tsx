"use client";

import * as React from "react";
import { MessageCircle, ChevronDown, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  waTemplateFollowUp,
  waTemplateDocumentReminder,
  waTemplateScheduleConsultation,
  waTemplateGeneral,
  type LeadContext,
} from "@/lib/whatsapp-templates";

/**
 * WhatsApp template selector for admin lead detail.
 * Offers pre-defined message templates for common scenarios.
 */
export function WhatsAppTemplateButton({ lead }: { lead: LeadContext }) {
  const templates = [
    {
      label: "Tindak Lanjut",
      desc: "Pengenalan + konteks layanan",
      getUrl: () => waTemplateFollowUp(lead),
    },
    {
      label: "Pengingat Dokumen",
      desc: "Minta persiapan dokumen",
      getUrl: () => waTemplateDocumentReminder(lead, lead.serviceName ?? undefined),
    },
    {
      label: "Jadwalkan Konsultasi",
      desc: "Usulkan waktu konsultasi",
      getUrl: () => waTemplateScheduleConsultation(lead),
    },
    {
      label: "Pesan Umum",
      desc: "Sapaan awal tanpa konteks spesifik",
      getUrl: () => waTemplateGeneral(lead),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-[#1ebe5b]"
        >
          <MessageCircle className="size-4" />
          Chat via WhatsApp
          <ChevronDown className="size-3.5 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Pilih Template Pesan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((tpl) => (
          <DropdownMenuItem key={tpl.label} asChild>
            <a
              href={tpl.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5 py-2"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-navy">
                <Send className="size-3.5 text-[#25D366]" />
                {tpl.label}
              </span>
              <span className="pl-5.5 text-xs text-ink-soft">{tpl.desc}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

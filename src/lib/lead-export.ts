/**
 * Lead Excel Export Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a branded .xlsx workbook from an array of leads. The workbook has:
 *   - A single "Leads" sheet.
 *   - Header row with navy background + white bold text (PINTU LEGAL brand).
 *   - Auto-sized columns (capped at 60 chars to avoid runaway widths).
 *   - An Indonesia-localized column set: Nama, Telepon, Email, Nama Usaha,
 *     Layanan, Status, Sumber, Skor, Pesan, Diterima.
 *
 * The function is isomorphic: it works in the browser (returns an ArrayBuffer
 * wrapped in a Blob-ready Uint8Array) and on the server (Node Buffer).
 *
 * Brand colors are hard-coded as hex (not CSS vars) because the xlsx library
 * writes raw RGB into the file — Tailwind tokens are not available here.
 */
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { calculateLeadScore, type LeadScoreInput } from "@/lib/lead-scoring";

export type LeadExportRow = LeadScoreInput & {
  name: string;
  phone: string;
  serviceName?: string | null;
  message?: string;
  createdAt?: string; // ISO
};

const NAVY_HEX = "0F2747";
const WHITE_HEX = "FFFFFF";
const GOLD_HEX = "C89B3C";

const COLUMN_DEFS: {
  key: string;
  label: string;
  /** soft cap so very long messages don't blow out the column width. */
  maxWidth: number;
}[] = [
  { key: "name", label: "Nama", maxWidth: 30 },
  { key: "phone", label: "Telepon", maxWidth: 18 },
  { key: "email", label: "Email", maxWidth: 36 },
  { key: "businessName", label: "Nama Usaha", maxWidth: 30 },
  { key: "serviceName", label: "Layanan", maxWidth: 28 },
  { key: "status", label: "Status", maxWidth: 14 },
  { key: "source", label: "Sumber", maxWidth: 12 },
  { key: "score", label: "Skor", maxWidth: 8 },
  { key: "message", label: "Pesan", maxWidth: 60 },
  { key: "receivedAt", label: "Diterima", maxWidth: 22 },
];

function formatReceivedAt(iso?: string): string {
  if (!iso) return "";
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: idLocale });
  } catch {
    return iso;
  }
}

function statusLabel(status?: string): string {
  const map: Record<string, string> = {
    NEW: "Baru",
    CONTACTED: "Dihubungi",
    QUALIFIED: "Qualified",
    CONVERTED: "Terkonversi",
    LOST: "Hilang",
  };
  if (!status) return "";
  return map[status] ?? status;
}

function sourceLabel(source?: string): string {
  const map: Record<string, string> = {
    WEBSITE: "Website",
    WHATSAPP: "WhatsApp",
    NEWSLETTER: "Newsletter",
    ADMIN: "Admin",
  };
  if (!source) return "";
  return map[source] ?? source;
}

/**
 * Build a typed array-of-arrays (AOA) for the worksheet. The first row holds
 * the header labels, subsequent rows are per-lead values in column order.
 *
 * Each cell is coerced to a string so Excel doesn't try to interpret phone
 * numbers as numeric (which would drop leading zeros).
 */
function buildAoa(leads: LeadExportRow[]): (string | number)[][] {
  const header = COLUMN_DEFS.map((c) => c.label);
  const rows = leads.map((lead) => {
    const score = calculateLeadScore(lead).score;
    return COLUMN_DEFS.map((col) => {
      switch (col.key) {
        case "serviceName":
          return lead.serviceName ?? "";
        case "status":
          return statusLabel(lead.status);
        case "source":
          return sourceLabel(lead.source);
        case "score":
          return score;
        case "receivedAt":
          return formatReceivedAt(lead.createdAt);
        default:
          return String((lead as Record<string, unknown>)[col.key] ?? "");
      }
    });
  });
  return [header, ...rows];
}

/**
 * Generate an .xlsx file as an ArrayBuffer. This is the isomorphic core — it
 * returns raw bytes that can be wrapped in a Blob (browser) or Buffer
 * (Node) by the caller.
 */
export function buildLeadsExcel(leads: LeadExportRow[]): ArrayBuffer {
  const aoa = buildAoa(leads);
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ─── Auto-size columns (capped) ───────────────────────────────────────────
  const colWidths = COLUMN_DEFS.map((col, colIdx) => {
    let maxLen = col.label.length;
    for (const row of aoa) {
      const cell = row[colIdx];
      if (cell === undefined || cell === null) continue;
      const len = String(cell).length;
      if (len > maxLen) maxLen = len;
    }
    // +2 padding for breathing room; cap at maxWidth.
    return { wch: Math.min(col.maxWidth, maxLen + 2) };
  });
  ws["!cols"] = colWidths;

  // ─── Header styling (navy fill, white bold text, gold bottom border) ──────
  const headerRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    const cell = ws[addr];
    if (!cell) continue;
    cell.s = {
      fill: { fgColor: { rgb: NAVY_HEX } },
      font: { bold: true, color: { rgb: WHITE_HEX }, sz: 11 },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        bottom: { style: "medium", color: { rgb: GOLD_HEX } },
      },
    };
  }

  // Freeze the header row + first column (Nama) for easier scanning.
  ws["!freeze"] = { xSplit: "1", ySplit: "1", topLeftCell: "B2", state: "frozen" };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  // `bookType: 'xlsx'` forces the OOXML output; `type: 'array'` returns an
  // ArrayBuffer which is the safest cross-platform return type.
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  return out as ArrayBuffer;
}

/**
 * Browser-side helper: builds the workbook, wraps it in a Blob, and triggers
 * a download with the given filename. Falls back to `pintu-legal-leads-{date}.xlsx`
 * when no filename is supplied.
 */
export function downloadLeadsExcel(
  leads: LeadExportRow[],
  filename?: string
): void {
  if (typeof window === "undefined") {
    throw new Error(
      "downloadLeadsExcel() can only be called in the browser. Use buildLeadsExcel() on the server."
    );
  }
  const buffer = buildLeadsExcel(leads);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `pintu-legal-leads-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Default filename generator used by the leads table. Mirrors the CSV
 * behaviour: when a date range is applied, the filename self-describes it;
 * otherwise falls back to `leads-export-{today}.xlsx`.
 */
export function defaultExcelFilename(from?: string, to?: string): string {
  if (from || to) {
    const fromPart = from || "mulai";
    const toPart = to || "kini";
    return `leads-${fromPart}-to-${toPart}.xlsx`;
  }
  return `leads-export-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
}

import * as React from "react";
import { cn, slugify, uniqueSlug } from "@/lib/utils";

/**
 * Tiny inline markdown-ish renderer — server-safe (no "use client").
 * Supports:
 *   - "# H1"
 *   - "## H2"   (receives an `id` for anchor links / TOC)
 *   - "### H3"  (receives an `id` for anchor links / TOC)
 *   - "- " bullet list items (consecutive lines group into <ul>)
 *   - "1. " ordered list items (consecutive lines group into <ol>)
 *   - "**bold**" inline
 *   - blank line separates paragraphs
 *
 * Designed for our short-form blog content — NOT a full markdown lib.
 *
 * Heading ids are generated deterministically from heading text using
 * the shared `slugify` + `uniqueSlug` helpers, so `getTableOfContents`
 * (below) and the rendered <h2>/<h3> ids stay in sync across renders.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parseContent(content);
  return (
    <div className={cn("space-y-5 text-[1.05rem] leading-relaxed text-ink-soft", className)}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "h1":
            return (
              <h1
                key={i}
                id={block.id}
                className="text-2xl font-bold tracking-tight text-navy sm:text-3xl"
              >
                {renderInline(block.text)}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={i}
                id={block.id}
                className="mt-8 scroll-mt-28 text-xl font-bold tracking-tight text-navy sm:text-2xl"
              >
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                id={block.id}
                className="mt-6 scroll-mt-28 text-lg font-bold text-navy"
              >
                {renderInline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2 pl-1">
                {block.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                    />
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-2">
                {block.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-xs font-bold text-navy ring-1 ring-navy-100"
                    >
                      {j + 1}
                    </span>
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case "p":
          default:
            return (
              <p key={i}>{renderInline(block.text ?? "")}</p>
            );
        }
      })}
    </div>
  );
}

// ─── Table of contents helper ──────────────────────────────────────────────

export type TocItem = { level: 2 | 3; text: string; id: string };

/**
 * Extract ## and ### headings from markdown content as a flat list with
 * deterministic ids matching the rendered <h2>/<h3> elements.
 *
 * # (h1) headings are deliberately excluded per the task brief, but they
 * still participate in the uniqueness counter so ids stay consistent with
 * the Markdown renderer (which assigns ids to h1 too).
 */
export function getTableOfContents(content: string): TocItem[] {
  const blocks = parseContent(content);
  return blocks
    .filter((b): b is { kind: "h2" | "h3"; text: string; id: string } =>
      b.kind === "h2" || b.kind === "h3"
    )
    .map((b) => ({ level: b.kind, text: b.text, id: b.id }));
}

// ─── helpers ──────────────────────────────────────────────────────────────

type HeadingBlock = { kind: "h1" | "h2" | "h3"; text: string; id: string };
type Block =
  | HeadingBlock
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] };

function parseContent(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const seen = new Map<string, number>();
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    // Blank line — skip
    if (line === "") {
      i++;
      continue;
    }

    // Headings — assign deterministic slug id (h1 included so uniqueness
    // counter matches getTableOfContents exactly).
    if (line.startsWith("### ")) {
      const text = line.slice(4).trim();
      blocks.push({ kind: "h3", text, id: uniqueSlug(slugify(text), seen) });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      blocks.push({ kind: "h2", text, id: uniqueSlug(slugify(text), seen) });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      const text = line.slice(2).trim();
      blocks.push({ kind: "h1", text, id: uniqueSlug(slugify(text), seen) });
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l.startsWith("- ") || l.startsWith("* ")) {
          items.push(l.slice(2).trim());
          i++;
        } else if (l === "") {
          i++;
          break;
        } else {
          break;
        }
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    // Ordered list (e.g. "1. " or "1) ")
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (/^\d+[.)]\s+/.test(l)) {
          items.push(l.replace(/^\d+[.)]\s+/, "").trim());
          i++;
        } else if (l === "") {
          i++;
          break;
        } else {
          break;
        }
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const para: string[] = [line];
    i++;
    while (i < lines.length) {
      const l = lines[i].trim();
      if (
        l === "" ||
        l.startsWith("# ") ||
        l.startsWith("## ") ||
        l.startsWith("### ") ||
        l.startsWith("- ") ||
        l.startsWith("* ") ||
        /^\d+[.)]\s+/.test(l)
      ) {
        break;
      }
      para.push(l);
      i++;
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }

  return blocks;
}

/** Render **bold** segments inline. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

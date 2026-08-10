import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Client-side pagination component for blog listing.
 * Calls onPageChange when a page is selected.
 */
export function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const showAround = 1;

  pages.push(1);

  if (currentPage - showAround > 2) {
    pages.push("...");
  }

  for (
    let i = Math.max(2, currentPage - showAround);
    i <= Math.min(totalPages - 1, currentPage + showAround);
    i++
  ) {
    pages.push(i);
  }

  if (currentPage + showAround < totalPages - 1) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  const handlePageChange = (page: number) => {
    onPageChange(page);
    // Scroll to top of blog grid
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Navigasi halaman blog"
      className="flex items-center justify-center gap-1.5"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : (
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-alt text-ink-soft/40" aria-hidden>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-sm text-ink-soft"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "grid h-9 min-w-9 place-items-center rounded-lg px-3 text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-navy text-white shadow-soft"
                : "border border-border bg-white text-navy hover:border-navy hover:bg-navy-50"
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-alt text-ink-soft/40" aria-hidden>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

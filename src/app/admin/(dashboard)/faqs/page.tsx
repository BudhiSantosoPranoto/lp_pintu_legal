import { db } from "@/lib/db";
import { FaqsTable } from "@/components/admin/faqs-table";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await db.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const safeFaqs = faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
    isActive: f.isActive,
    sortOrder: f.sortOrder,
  }));

  // Derive category options from existing FAQs (preserving first-seen order).
  const categories: string[] = [];
  for (const f of safeFaqs) {
    if (!categories.includes(f.category)) categories.push(f.category);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink">
          FAQ <span className="text-ink-soft font-medium">({safeFaqs.length})</span>
        </h2>
        <p className="text-sm text-ink-soft mt-1">
          Kelola daftar pertanyaan umum yang tampil di halaman publik /faq.
        </p>
      </div>

      <FaqsTable faqs={safeFaqs} existingCategories={categories} />
    </div>
  );
}

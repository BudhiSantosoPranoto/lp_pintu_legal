import {
  SectionHeading,
  Reveal,
} from "@/components/site/section-primitives";

const values = [
  {
    num: "01",
    name: "Profesional",
    desc: "Pendampingan dengan proses yang jelas.",
  },
  {
    num: "02",
    name: "Transparan",
    desc: "Informasi layanan disampaikan secara terbuka.",
  },
  {
    num: "03",
    name: "Praktis",
    desc: "Proses komunikasi dibuat sederhana.",
  },
  {
    num: "04",
    name: "Terarah",
    desc: "Setiap kebutuhan dibantu dari awal hingga selesai.",
  },
  {
    num: "05",
    name: "Responsif",
    desc: "Tim siap membantu menjawab kebutuhan pelanggan.",
  },
  {
    num: "06",
    name: "Berorientasi Bisnis",
    desc: "Legalitas bukan sekadar dokumen, tetapi fondasi bisnis.",
  },
];

export function WhyPintuLegal() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-surface-alt py-20 sm:py-24"
    >
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          id="why-heading"
          eyebrow="Kenapa Pintu Legal"
          title="Kenapa Memilih Pintu Legal?"
          description="Kami percaya legalitas bukan sekadar dokumen, tetapi fondasi bisnis yang sehat."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {values.map((v, i) => (
            <Reveal key={v.num} delay={(i % 3) * 0.08}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-200 hover:shadow-soft-lg">
                {/* Top gradient accent on hover */}
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-gold-600 transition-transform duration-300 group-hover:scale-x-100" />

                {/* Gold glow on hover */}
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/0 blur-2xl transition-all duration-500 group-hover:bg-gold/10"
                  aria-hidden
                />

                {/* Large outline number — hidden on mobile to reduce clutter */}
                <span
                  className="pointer-events-none absolute -right-2 -top-4 hidden select-none text-7xl font-extrabold leading-none text-transparent transition-all duration-300 [-webkit-text-stroke:2px_var(--gold-400)] group-hover:[-webkit-text-stroke-color:var(--gold)] sm:block"
                  aria-hidden
                >
                  {v.num}
                </span>
                {/* Mobile number badge */}
                <span
                  className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold-50 text-sm font-bold text-gold-600 ring-1 ring-gold-200 sm:hidden"
                  aria-hidden
                >
                  {v.num}
                </span>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold tracking-tight text-navy transition-colors group-hover:text-gold-600">
                    {v.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {v.desc}
                  </p>
                </div>
                <span className="relative z-10 mt-5 h-0.5 w-10 rounded-full bg-gold-200 transition-all duration-300 group-hover:w-16 group-hover:bg-gold" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

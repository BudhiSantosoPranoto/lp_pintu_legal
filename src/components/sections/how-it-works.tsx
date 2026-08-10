import {
  SectionHeading,
  Reveal,
} from "@/components/site/section-primitives";

const steps = [
  {
    num: "01",
    title: "Konsultasi",
    desc: "Ceritakan kebutuhan bisnis Anda.",
  },
  {
    num: "02",
    title: "Tentukan Layanan",
    desc: "Tim membantu menentukan layanan yang sesuai.",
  },
  {
    num: "03",
    title: "Proses Legalitas",
    desc: "Dokumen dan proses dikerjakan sesuai kebutuhan.",
  },
  {
    num: "04",
    title: "Selesai",
    desc: "Dokumen legalitas diserahkan kepada pelanggan.",
  },
];

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="py-20 sm:py-24"
    >
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          id="how-heading"
          eyebrow="Proses"
          title="Bagaimana Prosesnya?"
          description="Empat langkah sederhana dari konsultasi hingga dokumen legalitas diserahkan."
        />

        {/* Mobile: vertical timeline */}
        <div className="mt-12 space-y-6 lg:hidden">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.08}>
              <div className="relative flex gap-4">
                {/* Left rail */}
                <div className="flex flex-col items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white ring-4 ring-gold-200">
                    {s.num}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-6 pt-1.5">
                  <h3 className="text-base font-bold text-navy">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="relative mt-14 hidden lg:block">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-[22px] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="grid grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center">
                  <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-white ring-4 ring-gold-200 shadow-soft">
                    {s.num}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

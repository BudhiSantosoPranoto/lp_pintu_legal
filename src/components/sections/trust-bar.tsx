import { ShieldCheck, Eye, Compass, Zap } from "lucide-react";
import { Reveal } from "@/components/site/section-primitives";

const values = [
  {
    icon: ShieldCheck,
    label: "Profesional",
    desc: "Pendampingan dengan proses yang jelas.",
  },
  {
    icon: Eye,
    label: "Transparan",
    desc: "Informasi layanan disampaikan secara terbuka.",
  },
  {
    icon: Compass,
    label: "Terarah",
    desc: "Setiap kebutuhan dibantu dari awal hingga selesai.",
  },
  {
    icon: Zap,
    label: "Responsif",
    desc: "Tim siap membantu menjawab kebutuhan pelanggan.",
  },
];

export function TrustBar() {
  return (
    <section
      aria-label="Keunggulan layanan Pintu Legal"
      className="border-y border-border bg-surface-alt"
    >
      <div className="container-px mx-auto max-w-7xl py-12 sm:py-14">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Legalitas yang lebih jelas. Proses yang lebih terarah.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">
            Pintu Legal hadir untuk membuat proses legalitas bisnis menjadi
            lebih mudah dipahami.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.label} delay={i * 0.06}>
              <div className="group flex h-full flex-col items-start gap-3 rounded-2xl border border-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy ring-1 ring-navy-100 transition-colors group-hover:bg-navy group-hover:text-gold">
                  <v.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-base font-bold text-navy">{v.label}</p>
                  <p className="mt-1 text-sm leading-snug text-ink-soft">
                    {v.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

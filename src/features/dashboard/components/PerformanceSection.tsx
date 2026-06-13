const PERF_CARDS = [
  {
    icon: "↗",
    label: "Originação",
    value: "R$ 168k",
    sub: "Meta R$ 250k · 67% no ritmo",
    progress: 67,
    status: "ok" as const,
    chip: "5 cotações suas aguardando análise",
    chipVariant: "green" as const,
  },
  {
    icon: "%",
    label: "Taxa média",
    value: "9,8%",
    sub: "Piso 10,4% · abaixo do mínimo",
    progress: 55,
    status: "warn" as const,
    chip: "Evite taxas abaixo de 10,4%",
    chipVariant: "red" as const,
  },
  {
    icon: "!",
    label: "Inadimplência",
    value: "3,1%",
    sub: "Limite 3,5% · dentro do limite",
    progress: 89,
    status: "ok" as const,
    chip: "Carteira saudável · siga acompanhando",
    chipVariant: "green" as const,
  },
  {
    icon: "↺",
    label: "Renovações",
    value: "75%",
    sub: "9 de 12 encerrando · meta 70%",
    progress: 100,
    status: "ok" as const,
    chip: "3 contratos elegíveis para renovação",
    chipVariant: "green" as const,
  },
];

function PerfCard({
  icon,
  label,
  value,
  sub,
  progress,
  status,
  chip,
  chipVariant,
}: (typeof PERF_CARDS)[number]) {
  const barColor =
    status === "warn"
      ? "bg-[#D84040]"
      : progress >= 100
        ? "bg-brand-yellow"
        : "bg-[#1D9E75]";
  const chipStyle =
    chipVariant === "red"
      ? "bg-destructive-bg text-destructive"
      : chipVariant === "green"
        ? "bg-success-bg text-success"
        : "bg-warning-bg text-warning";

  return (
    <div className="flex w-52 shrink-0 flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:w-auto">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      <div>
        <p className="font-fraunces text-2xl font-bold leading-tight text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">{sub}</p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div
        className={`flex items-start gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${chipStyle}`}
      >
        <span className="mt-0.5 shrink-0">→</span>
        <span>{chip}</span>
      </div>
    </div>
  );
}

export function PerformanceSection() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="px-5 pt-6 md:px-8">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-base font-semibold text-foreground md:text-lg">
          Meu desempenho do mês
        </span>
        <span className="text-xs text-muted-foreground/80">
          1 a {day} de {month}
        </span>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        {PERF_CARDS.map((card) => (
          <PerfCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}

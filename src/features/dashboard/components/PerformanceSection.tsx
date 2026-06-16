import { fmtBRL } from "@/lib/utils";
import type { MonthPerformance } from "@/services/dashboard/dashboard.types";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceSectionProps {
  data?: MonthPerformance;
  isLoading?: boolean;
}

const ORIGINATION_TARGET = 250000; // Meta de originação em reais
const RATE_FLOOR = 10.4; // Piso de taxa média em percentual
const DELINQUENCY_LIMIT = 3.5; // Limite de inadimplência em percentual

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return fmtBRL(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

interface PerfCardProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  progress: number;
  status: "ok" | "warn";
  chip: string;
  chipVariant: "green" | "red" | "amber";
}

function PerfCard({
  icon,
  label,
  value,
  sub,
  progress,
  status,
  chip,
  chipVariant,
}: PerfCardProps) {
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

export function PerformanceSection({ data, isLoading }: PerformanceSectionProps) {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("pt-BR", { month: "long" });

  if (isLoading || !data) {
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate performance cards from real data
  const perfCards = [
    {
      icon: "↗",
      label: "Originação",
      value: formatCurrency(data.origination.amount),
      sub: `Meta ${formatCurrency(ORIGINATION_TARGET)} · ${formatPercent((data.origination.amount / ORIGINATION_TARGET) * 100)} no ritmo`,
      progress: Math.min((data.origination.amount / ORIGINATION_TARGET) * 100, 100),
      status: (data.origination.amount / ORIGINATION_TARGET) >= 0.5 ? ("ok" as const) : ("warn" as const),
      chip: `${data.origination.count} contrato(s) originado(s)`,
      chipVariant: "green" as const,
    },
    {
      icon: "%",
      label: "Taxa média",
      value: data.averageRate !== null ? formatPercent(data.averageRate) : "N/A",
      sub: `Piso ${formatPercent(RATE_FLOOR)} · ${data.averageRate !== null && data.averageRate >= RATE_FLOOR ? "acima do mínimo" : "abaixo do mínimo"}`,
      progress: data.averageRate !== null ? Math.min((data.averageRate / RATE_FLOOR) * 100, 100) : 0,
      status: data.averageRate !== null && data.averageRate >= RATE_FLOOR ? ("ok" as const) : ("warn" as const),
      chip: data.averageRate !== null && data.averageRate < RATE_FLOOR ? `Evite taxas abaixo de ${formatPercent(RATE_FLOOR)}` : "Taxa dentro do esperado",
      chipVariant: data.averageRate !== null && data.averageRate < RATE_FLOOR ? ("red" as const) : ("green" as const),
    },
    {
      icon: "!",
      label: "Inadimplência",
      value: formatPercent(data.delinquency.rate),
      sub: `Limite ${formatPercent(DELINQUENCY_LIMIT)} · ${data.delinquency.rate <= DELINQUENCY_LIMIT ? "dentro do limite" : "acima do limite"}`,
      progress: Math.min((data.delinquency.rate / DELINQUENCY_LIMIT) * 100, 100),
      status: data.delinquency.rate <= DELINQUENCY_LIMIT ? ("ok" as const) : ("warn" as const),
      chip: data.delinquency.rate <= DELINQUENCY_LIMIT ? "Carteira saudável · siga acompanhando" : "Atenção à inadimplência",
      chipVariant: data.delinquency.rate <= DELINQUENCY_LIMIT ? ("green" as const) : ("red" as const),
    },
    {
      icon: "↺",
      label: "Renovações",
      value: `${data.renewals}`,
      sub: `${data.renewals} renovação(ões) no mês`,
      progress: Math.min((data.renewals / (data.origination.count || 1)) * 100, 100),
      status: "ok" as const,
      chip: "Continue focando na retenção",
      chipVariant: "green" as const,
    },
  ];

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
        {perfCards.map((card) => (
          <PerfCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}

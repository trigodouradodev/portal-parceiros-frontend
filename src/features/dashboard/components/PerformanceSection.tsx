import type { MonthPerformance } from "@/services/dashboard/dashboard.types";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceCard } from "@/features/dashboard/components/PerformanceCard";
import {
  ORIGINATION_TARGET,
  RATE_FLOOR,
  DELINQUENCY_LIMIT,
} from "@/features/dashboard/constants/performance.constants";
import {
  formatCurrency,
  formatPercent,
} from "@/features/dashboard/utils/formatters";

interface PerformanceSectionProps {
  data?: MonthPerformance;
  isLoading?: boolean;
}

export function PerformanceSection({
  data,
  isLoading,
}: PerformanceSectionProps) {
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
      progress: Math.min(
        (data.origination.amount / ORIGINATION_TARGET) * 100,
        100,
      ),
      status:
        data.origination.amount / ORIGINATION_TARGET >= 0.5
          ? ("ok" as const)
          : ("warn" as const),
      chip: `${data.origination.count} contrato(s) originado(s)`,
      chipVariant: "green" as const,
    },
    {
      icon: "%",
      label: "Taxa média",
      value:
        data.averageRate !== null ? formatPercent(data.averageRate) : "N/A",
      sub: `Piso ${formatPercent(RATE_FLOOR)} · ${data.averageRate !== null && data.averageRate >= RATE_FLOOR ? "acima do mínimo" : "abaixo do mínimo"}`,
      progress:
        data.averageRate !== null
          ? Math.min((data.averageRate / RATE_FLOOR) * 100, 100)
          : 0,
      status:
        data.averageRate !== null && data.averageRate >= RATE_FLOOR
          ? ("ok" as const)
          : ("warn" as const),
      chip:
        data.averageRate !== null && data.averageRate < RATE_FLOOR
          ? `Evite taxas abaixo de ${formatPercent(RATE_FLOOR)}`
          : "Taxa dentro do esperado",
      chipVariant:
        data.averageRate !== null && data.averageRate < RATE_FLOOR
          ? ("red" as const)
          : ("green" as const),
    },
    {
      icon: "!",
      label: "Inadimplência",
      value: formatPercent(data.delinquency.rate),
      sub: `Limite ${formatPercent(DELINQUENCY_LIMIT)} · ${data.delinquency.rate <= DELINQUENCY_LIMIT ? "dentro do limite" : "acima do limite"}`,
      progress: Math.min(
        (data.delinquency.rate / DELINQUENCY_LIMIT) * 100,
        100,
      ),
      status:
        data.delinquency.rate <= DELINQUENCY_LIMIT
          ? ("ok" as const)
          : ("warn" as const),
      chip:
        data.delinquency.rate <= DELINQUENCY_LIMIT
          ? "Carteira saudável · siga acompanhando"
          : "Atenção à inadimplência",
      chipVariant:
        data.delinquency.rate <= DELINQUENCY_LIMIT
          ? ("green" as const)
          : ("red" as const),
    },
    {
      icon: "↺",
      label: "Renovações",
      value: `${data.renewals}`,
      sub: `${data.renewals} renovação(ões) no mês`,
      progress: Math.min(
        (data.renewals / (data.origination.count || 1)) * 100,
        100,
      ),
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
          <PerformanceCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}

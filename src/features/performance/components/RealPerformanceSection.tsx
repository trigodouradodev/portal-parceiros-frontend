import { OriginationCard } from "@/features/performance/components/OriginationCard";
import { RealKpiCard } from "@/features/performance/components/RealKpiCard";
import { PortfolioSummary } from "@/features/performance/components/PortfolioSummary";
import { RemunerationSummary } from "@/features/performance/components/RemunerationSummary";
import { IndicatorDetails } from "@/features/performance/components/IndicatorDetails";
import { buildRealPerformanceView } from "@/features/performance/utils/build-real-performance-view";
import type { PerformanceData } from "@/services/performance/performance.types";

export function RealPerformanceSection({
  month,
  currentMonth,
  data,
}: {
  month: string;
  currentMonth: string;
  data: PerformanceData;
}) {
  const cards = buildRealPerformanceView(data);
  const origination = cards.find((card) => card.key === "origination");
  const metrics = cards.filter((card) => card.key !== "origination");

  return (
    <section
      aria-label="Desempenho da competência"
      className="min-w-0 space-y-4"
    >
      {month === currentMonth && (
        <p className="text-xs leading-relaxed text-[#697183]">
          Posição diária com base em D-1. Os indicadores podem mudar durante a
          competência.
        </p>
      )}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,1fr)] lg:items-start">
        <RemunerationSummary
          key={month}
          remuneration={data.remuneration}
          month={month}
        />
        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-1">
          {origination && (
            <OriginationCard
              label={origination.label}
              value={origination.value}
              sub={origination.sub}
              targetPercent={origination.targetPercent}
            />
          )}
          {metrics.length > 0 && (
            <div
              className={`grid gap-3 sm:gap-4 ${metrics.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {metrics.map(({ key, ...card }) => (
                <RealKpiCard key={key} {...card} />
              ))}
            </div>
          )}
          {cards.length === 0 && (
            <p className="rounded-2xl border border-[#E3E6ED] bg-white p-5 text-sm text-[#697183]">
              Não há indicadores disponíveis para esta modalidade nesta
              competência.
            </p>
          )}
          <PortfolioSummary delinquency={data.indicators.delinquency} />
          <IndicatorDetails data={data} />
        </div>
      </div>
    </section>
  );
}

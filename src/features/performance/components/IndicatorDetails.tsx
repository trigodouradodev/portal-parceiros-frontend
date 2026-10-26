import { fmtBRL } from "@/lib/utils";
import { fmtPct } from "@/features/performance/utils/format";
import type { PerformanceData } from "@/services/performance/performance.types";

export function IndicatorDetails({
  data,
  individual = false,
}: {
  data: PerformanceData;
  individual?: boolean;
}) {
  const { interestRate, delinquency } = data.indicators;
  const rows = [
    ...(interestRate.status === "NOT_APPLICABLE"
      ? []
      : [
          {
            label: "Taxa média simples",
            value: interestRate.simpleRate,
            format: fmtPct,
          },
          {
            label: "Taxa média ponderada",
            value: interestRate.weightedRate,
            format: fmtPct,
          },
        ]),
    ...(delinquency.status === "NOT_APPLICABLE"
      ? []
      : [
          {
            label: "Inadimplência total da carteira",
            value: delinquency.portfolioRate,
            format: fmtPct,
          },
          {
            label: "Inadimplência desconsiderada",
            value: delinquency.disregardedOverdueAmount,
            format: fmtBRL,
          },
          {
            label: "Carteira desconsiderada",
            value: delinquency.disregardedPortfolioAmount,
            format: fmtBRL,
          },
        ]),
  ].filter((row) => row.value !== null);
  if (rows.length === 0) return null;
  return (
    <details className="rounded-2xl border border-[#E3E6ED] bg-white px-5">
      <summary className="cursor-pointer py-4 text-xs font-semibold text-brand-navy outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40">
        Detalhes dos indicadores
      </summary>
      <p className="pb-3 text-xs leading-relaxed text-[#697183]">
        {individual
          ? "Valores informados no detalhamento da pessoa nesta competência."
          : "As médias e a carteira total são referências. Os cards mostram os indicadores considerados nas regras da competência."}
      </p>
      <dl className="grid gap-4 pb-5 text-xs sm:grid-cols-2">
        {rows.map(({ label, value, format }) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-[#6B7080]">{label}</dt>
            <dd className="shrink-0 font-semibold text-brand-navy">
              {format(value!)}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

import { fmtBRL } from "@/lib/utils";
import type { PerformanceDelinquency } from "@/services/performance/performance.types";

export function PortfolioSummary({
  delinquency,
}: {
  delinquency: PerformanceDelinquency;
}) {
  if (delinquency.status === "NOT_APPLICABLE") return null;
  const rows = [
    { label: "Carteira ativa", value: delinquency.portfolioAmount },
    { label: "Saldo em inadimplência", value: delinquency.overdueAmount },
  ].filter((row) => row.value !== null);
  if (rows.length === 0) return null;
  return (
    <section
      aria-label="Sua carteira"
      className="min-w-0 rounded-2xl border border-[#E3E6ED] bg-white p-5"
    >
      <h3 className="text-xs font-semibold text-brand-navy">Sua carteira</h3>
      <dl
        className={`mt-3 grid ${rows.length > 1 ? "grid-cols-2 divide-x divide-[#E3E6ED]" : "grid-cols-1"}`}
      >
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="min-w-0 pr-3 last:pr-0 [&:not(:first-child)]:pl-3 sm:pr-4 sm:[&:not(:first-child)]:pl-4"
          >
            <dt className="text-[11px] text-[#697183]">{label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold tracking-tight tabular-nums text-brand-navy sm:text-base">
              {fmtBRL(value!)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

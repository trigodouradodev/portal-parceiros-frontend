import { useId, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { fmtBRL } from "@/lib/utils";
import { formatMonth } from "@/features/performance/utils/format";
import type { PerformanceRemuneration } from "@/services/performance/performance.types";

const DESKTOP_QUERY = "(min-width: 1024px)";
function subscribeToLayout(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
function isDesktopLayout() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}
function serverLayout() {
  return false;
}

export function RemunerationSummary({
  remuneration,
  month,
}: {
  remuneration: PerformanceRemuneration;
  month: string;
}) {
  const isDesktop = useSyncExternalStore(
    subscribeToLayout,
    isDesktopLayout,
    serverLayout,
  );
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const isExpanded = expanded ?? isDesktop;
  const compositionId = useId();
  const components = [
    { label: "Fixo mensal", amount: remuneration.fixedAmount },
    {
      label: "Bônus de desembolso",
      amount: remuneration.disbursementBonusAmount,
    },
    { label: "Bônus de taxa", amount: remuneration.rateBonusAmount },
    { label: "Bônus de risco", amount: remuneration.riskBonusAmount },
    { label: "Acordos", amount: remuneration.agreementAmount },
    { label: "Bônus de produção", amount: remuneration.productionBonusAmount },
    {
      label: "Bônus de reembolso",
      amount: remuneration.reimbursementBonusAmount,
    },
  ].filter((component) => component.amount !== null);

  return (
    <section
      aria-label="Resumo da remuneração"
      className="min-w-0 overflow-hidden rounded-2xl border border-[#E3E6ED] bg-white lg:col-start-2 lg:row-start-1"
    >
      <div className="bg-brand-navy p-5 sm:p-6">
        <h3 className="text-xs font-medium text-white/60">
          Total da remuneração
        </h3>
        <p className="mt-2 break-words text-3xl font-semibold leading-tight tracking-tight tabular-nums text-white sm:text-[34px]">
          {remuneration.totalAmount === null
            ? "N/A"
            : fmtBRL(remuneration.totalAmount)}
        </p>
        <p className="mt-2 text-[11px] text-white/60">
          Total informado para {formatMonth(month)}
        </p>
      </div>
      <div className="px-5 sm:px-6">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={compositionId}
          onClick={() => setExpanded(!isExpanded)}
          className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left text-xs font-semibold text-brand-navy outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-navy/40"
        >
          Composição da remuneração
          <ChevronDown
            aria-hidden="true"
            size={16}
            className={`shrink-0 text-[#697183] transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        <div id={compositionId} hidden={!isExpanded}>
          <dl className="divide-y divide-[#EDF0F5] pb-2">
            {components.map(({ label, amount }) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3 py-3"
              >
                <dt className="min-w-0 text-xs text-[#535E75]">{label}</dt>
                <dd
                  className={`shrink-0 whitespace-nowrap text-right text-xs tabular-nums ${amount === 0 ? "font-normal text-[#7C8495]" : "font-semibold text-brand-navy"}`}
                >
                  {fmtBRL(amount!)}
                </dd>
              </div>
            ))}
          </dl>
          {components.length === 0 && (
            <p className="pb-4 text-xs text-[#697183]">
              Não há componentes informados nesta competência.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

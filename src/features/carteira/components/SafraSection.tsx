import { useMemo, useRef } from "react";
import { Percent, RefreshCw, type LucideIcon } from "lucide-react";
import { buildSafraMock } from "@/features/carteira/data/safra-mock";
import {
  ICON_CIRCLE,
  TONE_TEXT,
  fmtInt,
  fmtPct,
  inadTone,
  type KpiTone,
} from "@/features/carteira/utils/kpi";
import {
  formatTrendDelta,
  trendDirection,
  trendSentiment,
} from "@/features/carteira/utils/safra";
import { useDragScroll } from "@/hooks/useDragScroll";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { cn, fmtBRL } from "@/lib/utils";

const SENTIMENT_TEXT = {
  good: "text-[#0F6E56]",
  bad: "text-[#A32D2D]",
  neutral: "text-muted-foreground",
} as const;

export function SafraSection() {
  const summaryQuery = usePortfolioSummary();
  const summary = summaryQuery.data;

  const safra = useMemo(() => {
    if (!summary) return buildSafraMock();
    const outstanding = summary.active.outstandingAmount;
    const reneg = summary.renegotiatedOutstandingAmount;
    return buildSafraMock({
      projectedActiveBalance: outstanding,
      activeContracts: summary.active.contracts,
      renegotiatedOutstandingAmount: reneg,
      delinquencyPercent: summary.delinquency.rate,
    });
  }, [summary]);

  const months = safra.months;
  const current = months[0];
  const previous = months[1];
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragScroll = useDragScroll(scrollRef);

  // Não exibir série ilustrativa em ambientes reais (homolog/prod) até BE-02.
  if (safra.isMock) return null;
  if (!current || !previous) return null;

  const deltaInad = current.delinquencyPercent - previous.delinquencyPercent;
  const deltaReneg =
    current.renegotiatedSharePercent - previous.renegotiatedSharePercent;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-1 flex flex-wrap items-baseline gap-2">
        <h2 className="text-base font-semibold text-foreground md:text-lg">
          Indicadores de carteira por safra
        </h2>
        <span className="text-xs text-muted-foreground">Últimos 12 meses</span>
      </div>
      {safra.isMock ? (
        <p className="mb-4 text-[11px] text-muted-foreground">
          Série ilustrativa — endpoint de safra (BE-02) ainda não disponível.
        </p>
      ) : (
        <div className="mb-4" />
      )}

      <div className="mb-5 grid grid-cols-2 gap-3">
        <TrendCard
          icon={RefreshCw}
          tone="neutral"
          label="Reneg / Carteira"
          value={fmtPct(current.renegotiatedSharePercent)}
          delta={deltaReneg}
          monthLabel={current.label}
          invert
        />
        <TrendCard
          icon={Percent}
          tone={inadTone(current.delinquencyPercent)}
          label="% Inadimplência"
          value={fmtPct(current.delinquencyPercent)}
          delta={deltaInad}
          monthLabel={current.label}
          invert
        />
      </div>

      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span>↔</span> Arraste a lista para o lado pra ver todas as colunas
      </div>
      <div
        ref={scrollRef}
        {...dragScroll}
        className="no-scrollbar cursor-grab overflow-x-auto select-none active:cursor-grabbing"
      >
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-brand-navy px-3 py-2 text-left font-semibold text-white">
                Indicador
              </th>
              {months.map((month, index) => (
                <th
                  key={month.yearMonth}
                  className={cn(
                    "bg-brand-navy px-3 py-2 text-right font-semibold whitespace-nowrap",
                    index === 0 ? "text-brand-yellow" : "text-white/80",
                  )}
                >
                  {month.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SafraRow
              label="Saldo Ativo Projetado"
              values={months.map((m) => fmtBRL(m.projectedActiveBalance))}
            />
            <SafraRow
              label="Contratos Ativos"
              values={months.map((m) => fmtInt(m.activeContracts))}
            />
            <SafraRow
              label="Saldo Renegociado"
              values={months.map((m) =>
                fmtBRL(m.renegotiatedOutstandingAmount),
              )}
            />
            <SafraRow
              label="Reneg Carteira %"
              values={months.map((m) => fmtPct(m.renegotiatedSharePercent))}
            />
            <SafraRow
              label="% Inadimplência"
              values={months.map((m) => fmtPct(m.delinquencyPercent))}
              cellTone={months.map((m) => inadTone(m.delinquencyPercent))}
              last
            />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TrendCard({
  icon: Icon,
  tone,
  label,
  value,
  delta,
  monthLabel,
  invert,
}: {
  icon: LucideIcon;
  tone: KpiTone;
  label: string;
  value: string;
  delta: number;
  monthLabel: string;
  invert?: boolean;
}) {
  const direction = trendDirection(delta);
  const sentiment = trendSentiment(delta, Boolean(invert));
  const arrow = direction === "up" ? "↗" : direction === "down" ? "↘" : "—";

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_CIRCLE[tone]}`}
        >
          <Icon size={16} />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="font-fraunces text-xl leading-tight font-bold text-foreground">
        {value}
      </span>
      <span className={`text-xs font-medium ${SENTIMENT_TEXT[sentiment]}`}>
        {monthLabel} {arrow} ({formatTrendDelta(delta)})
      </span>
    </div>
  );
}

function SafraRow({
  label,
  values,
  cellTone,
  last,
}: {
  label: string;
  values: string[];
  cellTone?: KpiTone[];
  last?: boolean;
}) {
  return (
    <tr className={last ? undefined : "border-b border-border"}>
      <td className="sticky left-0 bg-white px-3 py-2.5 font-semibold whitespace-nowrap text-brand-navy">
        {label}
      </td>
      {values.map((value, index) => (
        <td
          key={`${label}-${index}`}
          className={cn(
            "px-3 py-2.5 text-right whitespace-nowrap",
            cellTone
              ? `${TONE_TEXT[cellTone[index]]} font-semibold`
              : "text-foreground",
            index === 0 && "bg-brand-yellow/10",
          )}
        >
          {value}
        </td>
      ))}
    </tr>
  );
}

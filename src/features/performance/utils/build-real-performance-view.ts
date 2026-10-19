import { fmtBRL } from "@/lib/utils";
import type { PerformanceData } from "@/services/performance/performance.types";
import { fmtPct } from "./format";

export interface RealKpiCardView {
  key: "origination" | "interestRate" | "delinquency" | "reimbursement";
  label: string;
  value: string;
  sub: string;
  targetAmount?: number | null;
  targetPercent?: number | null;
}

/** Apresenta valores oficiais; não calcula indicadores nem identifica faixas. */
export function buildRealPerformanceView(
  data: PerformanceData,
): RealKpiCardView[] {
  const { origination, interestRate, delinquency, reimbursement } =
    data.indicators;
  const unknown = data.level.key === "UNKNOWN";
  const informational = data.level.key === "AUREA" || unknown;
  const cards: RealKpiCardView[] = [];

  if (
    origination.status !== "NOT_APPLICABLE" &&
    (!unknown || origination.amount !== null)
  ) {
    const hasTarget = !informational && origination.targetAmount !== null;
    cards.push({
      key: "origination",
      label: "Originação no mês",
      value: origination.amount === null ? "N/A" : fmtBRL(origination.amount),
      targetAmount: hasTarget ? origination.targetAmount : null,
      targetPercent: hasTarget ? origination.targetPercent : null,
      sub:
        origination.amount === null
          ? "Sem medição nesta competência"
          : hasTarget
            ? `Meta mensal de ${fmtBRL(origination.targetAmount!)}`
            : informational
              ? "Indicador informativo para sua modalidade"
              : "Total originado na competência, sem meta mensal definida",
    });
  }
  if (
    interestRate.status !== "NOT_APPLICABLE" &&
    (!unknown || interestRate.rate !== null)
  ) {
    cards.push({
      key: "interestRate",
      label: "Taxa média",
      value: interestRate.rate === null ? "N/A" : fmtPct(interestRate.rate),
      sub:
        interestRate.rate === null
          ? "Sem medição nesta competência"
          : informational
            ? "Indicador informativo para sua modalidade"
            : "Taxa oficial utilizada no cálculo desta competência",
    });
  }
  if (
    delinquency.status !== "NOT_APPLICABLE" &&
    (!unknown || delinquency.rate !== null)
  ) {
    const hasAdjustments =
      (delinquency.disregardedOverdueAmount ?? 0) !== 0 ||
      (delinquency.disregardedPortfolioAmount ?? 0) !== 0;
    cards.push({
      key: "delinquency",
      label: "Inadimplência",
      value: delinquency.rate === null ? "N/A" : fmtPct(delinquency.rate),
      sub:
        delinquency.rate === null
          ? "Sem medição nesta competência"
          : informational
            ? "Indicador informativo para sua modalidade"
            : hasAdjustments
              ? "Indicador após as desconsiderações da competência"
              : "Indicador oficial da carteira nesta competência",
    });
  }
  if (
    reimbursement.status !== "NOT_APPLICABLE" &&
    (!unknown || reimbursement.amount !== null)
  ) {
    cards.push({
      key: "reimbursement",
      label: "Reembolso no mês",
      value:
        reimbursement.amount === null ? "N/A" : fmtBRL(reimbursement.amount),
      sub:
        reimbursement.amount === null
          ? "Sem medição nesta competência"
          : "Valor pago nas parcelas quitadas da carteira",
    });
  }
  return cards;
}

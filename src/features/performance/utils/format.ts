export const fmtPct = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";

export function formatMonth(month: string): string {
  return new Date(`${month}-01T12:00:00Z`).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Descreve o período pelo calendário, sem afirmar fechamento financeiro. */
export function getPeriodLabel(month: string, currentMonth: string): string {
  if (month === currentMonth) return "Prévia";
  return month < currentMonth ? "Mês completo" : "Competência futura";
}

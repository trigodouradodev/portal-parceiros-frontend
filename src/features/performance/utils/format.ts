export const fmtPct = (v: number, d = 1) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }) + "%";

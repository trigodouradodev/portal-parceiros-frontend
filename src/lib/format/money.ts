/** Formata um number para exibição: `1500` → `R$ 1.500,00`. */
export const fmtBRL = (value: number) =>
  "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

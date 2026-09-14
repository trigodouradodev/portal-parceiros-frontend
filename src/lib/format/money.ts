/** Formata um number para exibição: `1500` → `R$ 1.500,00`. */
export const fmtBRL = (value: number) =>
  "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

/** Máscara BRL para input: dígitos são centavos (`4` → `R$ 0,04`). */
export function formatMoneyBrl(value: string, maxDigits = 10): string {
  const digits = value.replace(/\D/g, "").slice(0, maxDigits);
  if (digits === "") return "";
  return fmtBRL(Number(digits) / 100);
}

/** Converte máscara BRL de volta para number (`R$ 1.500,00` → `1500`). */
export function parseMoneyBrl(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return 0;
  return Number(digits) / 100;
}

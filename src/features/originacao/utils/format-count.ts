/** Contagem inteira ≥ 0, com teto (ex.: filhos / pessoas na casa). */
export function formatCount(value: string, max = 99): string {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
}

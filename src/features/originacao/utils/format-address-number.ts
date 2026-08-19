/** Número do imóvel: letras, dígitos e barra (ex.: 10A, s/n). */
export function formatAddressNumber(value: string, maxLength = 10): string {
  return value.replace(/[^a-zA-Z0-9/]/g, "").slice(0, maxLength);
}

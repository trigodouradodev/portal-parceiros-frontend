/** Máscara progressiva de CPF: 000.000.000-00 */
export function formatCpf(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Máscara progressiva de CNPJ: 00.000.000/0001-00 */
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** Formata CPF/CNPJ completo para exibição. Valores parciais permanecem iguais. */
export function formatTaxId(taxId: string): string {
  const digits = taxId.replace(/\D/g, "");

  if (digits.length === 11) return formatCpf(digits);
  if (digits.length === 14) return formatCnpj(digits);

  return taxId;
}

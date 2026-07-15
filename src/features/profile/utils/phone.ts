/** Mantém só dígitos, limitado ao tamanho aceito pela API. */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 20);
}

/** Formata telefone BR para exibição: (11) 99400-7722. */
export function formatPhoneDisplay(value: string): string {
  const digits = digitsOnlyPhone(value).slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatParcelaCardLabel(
  installmentNumber: number,
  totalInstallments: number,
): string {
  return `Parc ${installmentNumber}/${totalInstallments}`;
}

export function formatContractCardLabel(contractNumber: string): string {
  const trimmed = contractNumber.trim();
  if (/^contrato\b/i.test(trimmed)) {
    return trimmed;
  }
  return `Contrato #${trimmed}`;
}

/**
 * Rótulo do status bruto do contrato (contracts.status). Sem tradução
 * conhecida pra todos os valores possíveis — cai pro valor bruto quando não
 * mapeado, em vez de escondê-lo.
 */
const CONTRACT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  active: "Ativo",
  disbursed: "Desembolsado",
  disbursing: "Desembolsando",
  sent: "Enviado",
  closed: "Encerrado",
  cancelled: "Cancelado",
  error: "Erro",
};

export function contractStatusLabel(status: string): string {
  return CONTRACT_STATUS_LABELS[status] ?? status;
}

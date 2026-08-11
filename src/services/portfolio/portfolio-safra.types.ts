/** Mês de indicadores de carteira por safra (contrato futuro de BE-02). */
export interface PortfolioSafraMonth {
  /** Rótulo curto, ex.: "ago. de 2026". */
  label: string;
  /** Chave estável YYYY-MM. */
  yearMonth: string;
  projectedActiveBalance: number;
  activeContracts: number;
  renegotiatedOutstandingAmount: number;
  renegotiatedSharePercent: number;
  delinquencyPercent: number;
}

export interface PortfolioSafraSummary {
  months: PortfolioSafraMonth[];
  /** true enquanto BE-02 não existir — UI usa série ilustrativa. */
  isMock: boolean;
}

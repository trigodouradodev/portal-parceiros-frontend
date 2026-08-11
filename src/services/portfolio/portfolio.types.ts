/** Valores da carteira vigente no instante da consulta. */
export interface ActivePortfolioSummary {
  outstandingAmount: number;
  contracts: number;
}

/** Inadimplência calculada pela regra de arrasto da view analítica. */
export interface DelinquencySummary {
  rate: number;
  amount: number;
  contracts: number;
}

/** Resumo executivo dos seis KPIs de carteira — GET /portfolio/summary. */
export interface PortfolioSummary {
  active: ActivePortfolioSummary;
  delinquency: DelinquencySummary;
  renegotiatedOutstandingAmount: number;
}

/** Pré-filtro do drill-down (contrato alinhado ao GET /contracts). */
export interface CarteiraDrillDownFilter {
  onlyDelinquency?: boolean;
  onlyRenegotiated?: boolean;
}

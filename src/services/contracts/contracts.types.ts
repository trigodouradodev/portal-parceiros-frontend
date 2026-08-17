/** Item de GET /contracts. */
export interface ContractListItem {
  id: string;
  contractNumber: string;
  clientName: string;
  companyName?: string;
  consultantName?: string;
  productName: string;
  disbursedAmount: number;
  projectedAmount: number;
  outstandingBalance: number;
  totalInstallments: number;
  disbursementDate?: string;
  nextInstallmentId?: string;
  nextDueDate?: string;
  /**
   * Opcional / forward-compat: a API ainda não devolve este campo.
   * Enquanto isso, a UI deriva atraso a partir de `nextDueDate`.
   */
  daysOverdue?: number;
  /**
   * Opcional / forward-compat: a API ainda não devolve este campo.
   * Enquanto isso, a UI exibe "—".
   */
  renegotiated?: boolean;
}

export interface ContractsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ContractsPage {
  items: ContractListItem[];
  pagination: ContractsPagination;
}

/** Query de GET /contracts. */
export interface ContractsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  products?: string[];
  startDate?: string;
  endDate?: string;
  /** Contratos com saldo pendente hoje (KPI Carteira/Contratos Ativos). */
  onlyActive?: boolean;
  onlyDelinquency?: boolean;
  onlyRenegotiated?: boolean;
}

/** Pré-filtro ao abrir o modal a partir de um KPI. */
export interface CarteiraDrillDownFilter {
  onlyActive?: boolean;
  onlyDelinquency?: boolean;
  onlyRenegotiated?: boolean;
}

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
  onlyDelinquency?: boolean;
  onlyRenegotiated?: boolean;
}

/** Pré-filtro ao abrir o modal a partir de um KPI. */
export interface CarteiraDrillDownFilter {
  onlyDelinquency?: boolean;
  onlyRenegotiated?: boolean;
}

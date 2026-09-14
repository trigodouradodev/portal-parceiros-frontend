/** Opção de GET /products. */
export interface ProductOption {
  id: string;
  description: string;
  minInterestRate: number;
  maxInterestRate: number;
  minInstallmentCount: number;
  maxInstallmentCount: number;
  enabled: boolean;
}

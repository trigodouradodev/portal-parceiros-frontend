/** Snapshot persistido de GET/POST /simulations. */
export interface SimulationSnapshot {
  id: string;
  createdAt: string;
  name: string;
  birthDate: string;
  email: string;
  telephone: string;
  document: string;
  productId: string;
  productName: string;
  interestRate: number;
  amount: number;
  installments: number;
  firstInstallmentDate: string;
  installmentAmount: number;
  simulationResult?: unknown;
}

export interface CreateSimulationPayload {
  name: string;
  document: string;
  birthDate: string;
  email: string;
  telephone: string;
  productId: string;
  amount: number;
  installments: number;
  firstInstallmentDate: string;
}

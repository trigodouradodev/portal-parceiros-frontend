/** Snapshot persistido de GET/POST/PATCH /simulations (`name`/`document` no GET). */
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

export type UpdateSimulationPayload = CreateSimulationPayload;

export interface ListSimulationsQuery {
  name?: string;
  document?: string;
}

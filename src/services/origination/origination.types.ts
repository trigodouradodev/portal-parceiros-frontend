export const SimulationStatus = {
  AVAILABLE: "available",
  CONVERTED: "converted",
} as const;

export type SimulationStatus =
  (typeof SimulationStatus)[keyof typeof SimulationStatus];

/** Snapshot persistido de GET/POST/PATCH /simulations (`name`/`document` no GET). */
export interface SimulationSnapshot {
  id: string;
  createdAt: string;
  status: SimulationStatus;
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
  totalAmountOwed?: number;
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

/** Payload financeiro de POST /simulations/preview (sem persistir). */
export interface PreviewSimulationPayload {
  productId: string;
  amount: number;
  installments: number;
  firstInstallmentDate: string;
}

/** Resposta de POST /simulations/preview (parcela Celcoin). */
export interface SimulationPreview {
  productId: string;
  amount: number;
  installments: number;
  firstInstallmentDate: string;
  interestRate: number;
  installmentAmount: number;
  totalAmountOwed: number;
}

export interface ListSimulationsQuery {
  name?: string;
  document?: string;
}

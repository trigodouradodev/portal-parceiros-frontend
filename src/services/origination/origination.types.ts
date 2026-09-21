export const SimulationStatus = {
  AVAILABLE: "available",
  CONVERTED: "converted",
} as const;

export type SimulationStatus =
  (typeof SimulationStatus)[keyof typeof SimulationStatus];

/** Snapshot persistido retornado pela listagem e pelo comando de simulação. */
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
  amount: number;
  installments: number;
  firstInstallmentDate: string;
  installmentAmount: number;
  simulationResult?: unknown;
}

export interface SimulatePayload {
  simulationId?: string;
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

export type SimulateResult =
  | { eligible: false; simulation: null }
  | { eligible: true; simulation: SimulationSnapshot };

export interface ListSimulationsQuery {
  name?: string;
  document?: string;
}

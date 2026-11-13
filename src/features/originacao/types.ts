import type {
  CreditRiskBand,
  SimulationSnapshot,
  SimulationStatus,
} from "@/services/origination/origination.types";

export type { CreditRiskBand, SimulationSnapshot, SimulationStatus };

/** Prefill handed off from eligibility into the simulation form. */
export interface EligibilityPrefill {
  name: string;
  cpf: string;
  birthDate: string;
}

export type OriginacaoTab = "eligibility" | "simulation" | "proposal";

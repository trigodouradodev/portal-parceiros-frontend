import type {
  SimulationSnapshot,
  SimulationStatus,
} from "@/services/origination/origination.types";

export type { SimulationSnapshot, SimulationStatus };

/** Prefill handed off from eligibility into the simulation form. */
export interface EligibilityPrefill {
  name: string;
  cpf: string;
  birthDate: string;
}

export type OriginacaoTab = "eligibility" | "simulation" | "proposal";

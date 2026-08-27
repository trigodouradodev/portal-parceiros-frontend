import type { SimulationSnapshot } from "@/services/origination/origination.types";

export type { SimulationSnapshot };

/** Prefill handed off from eligibility into the simulation form. */
export interface EligibilityPrefill {
  name: string;
  cpf: string;
  birthDate: string;
}

export type OriginacaoTab = "eligibility" | "simulation" | "proposal";

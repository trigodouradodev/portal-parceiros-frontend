import type { SimulationSnapshot } from "@/services/origination/origination.types";

/** Dados repassados da elegibilidade para pré-preencher a simulação. */
export interface DadosElegibilidade {
  nome: string;
  cpf: string;
  nascimento: string;
}

/** Snapshot de simulação persistida — mesmo contrato da API. */
export type SimulacaoSnapshot = SimulationSnapshot;

export type OriginacaoTab = "elegibilidade" | "simulacao" | "proposta";

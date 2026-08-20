import { createContext, useContext } from "react";
import type { ProposalSnapshot } from "@/features/originacao/data/proposal";
import type {
  DadosElegibilidade,
  OriginacaoTab,
  SimulacaoSnapshot,
} from "@/features/originacao/types";

export interface OriginacaoContextValue {
  activeTab: OriginacaoTab;
  setActiveTab: (tab: OriginacaoTab) => void;
  /** Prefill one-shot da elegibilidade → simulação. */
  dadosIniciais: DadosElegibilidade | null;
  setDadosIniciais: (dados: DadosElegibilidade) => void;
  consumeDadosIniciais: () => void;
  simulacoes: SimulacaoSnapshot[];
  addSimulacao: (snapshot: SimulacaoSnapshot) => void;
  proposals: ProposalSnapshot[];
  openProposalId: string | null;
  simulationFormOpen: boolean;
  setSimulationFormOpen: (open: boolean) => void;
  startProposal: (simulation: SimulacaoSnapshot) => void;
  openProposal: (id: string) => void;
  closeProposal: () => void;
  updateProposal: (proposal: ProposalSnapshot) => void;
}

export const OriginacaoContext = createContext<OriginacaoContextValue | null>(
  null,
);

export function useOriginacao() {
  const ctx = useContext(OriginacaoContext);
  if (!ctx) {
    throw new Error("useOriginacao must be used within OriginacaoProvider");
  }
  return ctx;
}

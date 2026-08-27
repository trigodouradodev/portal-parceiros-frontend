import { createContext, useContext } from "react";
import type { ProposalSnapshot } from "@/features/originacao/data/proposal";
import type {
  EligibilityPrefill,
  OriginacaoTab,
  SimulationSnapshot,
} from "@/features/originacao/types";

export interface OriginacaoContextValue {
  activeTab: OriginacaoTab;
  setActiveTab: (tab: OriginacaoTab) => void;
  /** One-shot eligibility → simulation prefill. */
  eligibilityPrefill: EligibilityPrefill | null;
  setEligibilityPrefill: (data: EligibilityPrefill) => void;
  clearEligibilityPrefill: () => void;
  simulations: SimulationSnapshot[];
  simulationsLoading: boolean;
  simulationsError: boolean;
  refetchSimulations: () => void;
  proposals: ProposalSnapshot[];
  openProposalId: string | null;
  startProposal: (simulation: SimulationSnapshot) => void;
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

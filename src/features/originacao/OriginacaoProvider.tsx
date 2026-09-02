import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createProposalFromSimulation,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import {
  OriginacaoContext,
  type OriginacaoContextValue,
} from "@/features/originacao/originacao-context";
import type {
  EligibilityPrefill,
  OriginacaoTab,
  SimulationSnapshot,
} from "@/features/originacao/types";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

export function OriginacaoProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<OriginacaoTab>("eligibility");
  const [eligibilityPrefill, setEligibilityPrefillState] =
    useState<EligibilityPrefill | null>(null);
  const [proposals, setProposals] = useState<ProposalSnapshot[]>([]);
  const [openProposalId, setOpenProposalId] = useState<string | null>(null);

  const simulationsQuery = useQuery({
    queryKey: originationKeys.simulations(),
    queryFn: () => originationService.listSimulations(),
  });

  const {
    data: simulations,
    isPending: simulationsPending,
    isFetching: simulationsFetching,
    isError: simulationsError,
    refetch: refetchSimulations,
  } = simulationsQuery;

  const setEligibilityPrefill = useCallback((data: EligibilityPrefill) => {
    setEligibilityPrefillState(data);
  }, []);

  const clearEligibilityPrefill = useCallback(() => {
    setEligibilityPrefillState(null);
  }, []);

  const startProposal = useCallback((simulation: SimulationSnapshot) => {
    const proposal = createProposalFromSimulation(simulation);
    setProposals((prev) => [...prev, proposal]);
    setOpenProposalId(proposal.id);
    setActiveTab("proposal");
  }, []);

  const openProposal = useCallback((id: string) => {
    setOpenProposalId(id);
  }, []);

  const closeProposal = useCallback(() => {
    setOpenProposalId(null);
  }, []);

  const updateProposal = useCallback((proposal: ProposalSnapshot) => {
    setProposals((prev) =>
      prev.map((item) => (item.id === proposal.id ? proposal : item)),
    );
  }, []);

  const value = useMemo<OriginacaoContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      eligibilityPrefill,
      setEligibilityPrefill,
      clearEligibilityPrefill,
      simulations: simulations ?? [],
      simulationsLoading:
        simulationsPending || (simulationsFetching && simulationsError),
      simulationsError,
      refetchSimulations,
      proposals,
      openProposalId,
      startProposal,
      openProposal,
      closeProposal,
      updateProposal,
    }),
    [
      activeTab,
      eligibilityPrefill,
      setEligibilityPrefill,
      clearEligibilityPrefill,
      simulations,
      simulationsPending,
      simulationsFetching,
      simulationsError,
      refetchSimulations,
      proposals,
      openProposalId,
      startProposal,
      openProposal,
      closeProposal,
      updateProposal,
    ],
  );

  return (
    <OriginacaoContext.Provider value={value}>
      {children}
    </OriginacaoContext.Provider>
  );
}

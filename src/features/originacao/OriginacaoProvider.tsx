import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/contexts/toast/toast-context";
import {
  createProposalFromSimulation,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { useCreateQuoteDraft } from "@/features/originacao/hooks/useCreateQuoteDraft";
import {
  OriginacaoContext,
  type OriginacaoContextValue,
} from "@/features/originacao/originacao-context";
import type {
  EligibilityPrefill,
  OriginacaoTab,
  SimulationSnapshot,
} from "@/features/originacao/types";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

export function OriginacaoProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const { mutateAsync: createQuoteDraft } = useCreateQuoteDraft();
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

  const startProposal = useCallback(
    async (simulation: SimulationSnapshot) => {
      const existing = proposals.find(
        (item) => item.simulation.id === simulation.id,
      );
      if (existing) {
        setOpenProposalId(existing.id);
        setActiveTab("proposal");
        return;
      }

      try {
        const draft = await createQuoteDraft(simulation.id);
        const proposal = createProposalFromSimulation(simulation, {
          id: draft.id,
          createdAt: draft.createdAt,
        });
        setProposals((prev) => [...prev, proposal]);
        setOpenProposalId(proposal.id);
        setActiveTab("proposal");
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível iniciar a proposta."),
          { variant: "destructive" },
        );
      }
    },
    [createQuoteDraft, proposals, showToast],
  );

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

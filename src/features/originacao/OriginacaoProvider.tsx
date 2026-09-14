import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/toast/toast-context";
import {
  createProposalFromSimulation,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { useCreateQuoteDraft } from "@/features/originacao/hooks/useCreateQuoteDraft";
import { mapQuoteDetailToProposal } from "@/features/originacao/mappers/map-quote-detail-to-form";
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
import { quotesKeys, quotesService } from "@/services/quotes/quotes.service";

function upsertProposal(
  prev: ProposalSnapshot[],
  proposal: ProposalSnapshot,
): ProposalSnapshot[] {
  const index = prev.findIndex((item) => item.id === proposal.id);
  if (index === -1) return [...prev, proposal];
  const next = [...prev];
  next[index] = proposal;
  return next;
}

export function OriginacaoProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: createQuoteDraft } = useCreateQuoteDraft();
  const [activeTab, setActiveTab] = useState<OriginacaoTab>("eligibility");
  const [eligibilityPrefill, setEligibilityPrefillState] =
    useState<EligibilityPrefill | null>(null);
  const [proposals, setProposals] = useState<ProposalSnapshot[]>([]);
  const [openProposalId, setOpenProposalId] = useState<string | null>(null);
  const [openingProposalId, setOpeningProposalId] = useState<string | null>(
    null,
  );

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
        setProposals((prev) => upsertProposal(prev, proposal));
        setOpenProposalId(proposal.id);
        setActiveTab("proposal");
        void queryClient.invalidateQueries({ queryKey: quotesKeys.listRoot() });
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível iniciar a proposta."),
          { variant: "destructive" },
        );
      }
    },
    [createQuoteDraft, proposals, queryClient, showToast],
  );

  const openProposal = useCallback(
    async (id: string) => {
      setOpeningProposalId(id);
      setActiveTab("proposal");
      try {
        const detail = await quotesService.getById(id);
        const proposal = mapQuoteDetailToProposal(detail);
        queryClient.setQueryData(quotesKeys.detail(id), detail);
        setProposals((prev) => upsertProposal(prev, proposal));
        setOpenProposalId(id);
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível abrir a proposta."),
          { variant: "destructive" },
        );
      } finally {
        setOpeningProposalId(null);
      }
    },
    [queryClient, showToast],
  );

  const closeProposal = useCallback(() => {
    setOpenProposalId(null);
  }, []);

  const updateProposal = useCallback((proposal: ProposalSnapshot) => {
    setProposals((prev) => upsertProposal(prev, proposal));
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
      openingProposalId,
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
      openingProposalId,
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

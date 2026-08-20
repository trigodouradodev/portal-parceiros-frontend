import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  createProposalFromSimulation,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import {
  OriginacaoContext,
  type OriginacaoContextValue,
} from "@/features/originacao/originacao-context";
import type {
  DadosElegibilidade,
  OriginacaoTab,
  SimulacaoSnapshot,
} from "@/features/originacao/types";

export function OriginacaoProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<OriginacaoTab>("elegibilidade");
  const [dadosIniciais, setDadosIniciaisState] =
    useState<DadosElegibilidade | null>(null);
  const [simulacoes, setSimulacoes] = useState<SimulacaoSnapshot[]>([]);
  const [proposals, setProposals] = useState<ProposalSnapshot[]>([]);
  const [openProposalId, setOpenProposalId] = useState<string | null>(null);

  const setDadosIniciais = useCallback((dados: DadosElegibilidade) => {
    setDadosIniciaisState(dados);
  }, []);

  const consumeDadosIniciais = useCallback(() => {
    setDadosIniciaisState(null);
  }, []);

  const addSimulacao = useCallback((snapshot: SimulacaoSnapshot) => {
    setSimulacoes((prev) => [...prev, snapshot]);
  }, []);

  const startProposal = useCallback((simulation: SimulacaoSnapshot) => {
    const proposal = createProposalFromSimulation(simulation);
    setProposals((prev) => [...prev, proposal]);
    setOpenProposalId(proposal.id);
    setActiveTab("proposta");
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
      dadosIniciais,
      setDadosIniciais,
      consumeDadosIniciais,
      simulacoes,
      addSimulacao,
      proposals,
      openProposalId,
      startProposal,
      openProposal,
      closeProposal,
      updateProposal,
    }),
    [
      activeTab,
      dadosIniciais,
      setDadosIniciais,
      consumeDadosIniciais,
      simulacoes,
      addSimulacao,
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

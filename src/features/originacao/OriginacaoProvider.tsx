import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  OriginacaoContext,
  type OriginacaoContextValue,
} from "@/features/originacao/originacao-context";
import type {
  OriginacaoTab,
  SimulacaoSnapshot,
} from "@/features/originacao/types";

export function OriginacaoProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<OriginacaoTab>("elegibilidade");
  const [simulacoes, setSimulacoes] = useState<SimulacaoSnapshot[]>([]);
  const [propostaSimulacao, setPropostaSimulacao] =
    useState<SimulacaoSnapshot | null>(null);

  const addSimulacao = useCallback((snapshot: SimulacaoSnapshot) => {
    setSimulacoes((prev) => [...prev, snapshot]);
  }, []);

  const iniciarProposta = useCallback((snapshot: SimulacaoSnapshot) => {
    setPropostaSimulacao(snapshot);
    setActiveTab("proposta");
  }, []);

  const clearProposta = useCallback(() => {
    setPropostaSimulacao(null);
  }, []);

  const value = useMemo<OriginacaoContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      simulacoes,
      addSimulacao,
      propostaSimulacao,
      iniciarProposta,
      clearProposta,
    }),
    [
      activeTab,
      simulacoes,
      addSimulacao,
      propostaSimulacao,
      iniciarProposta,
      clearProposta,
    ],
  );

  return (
    <OriginacaoContext.Provider value={value}>
      {children}
    </OriginacaoContext.Provider>
  );
}

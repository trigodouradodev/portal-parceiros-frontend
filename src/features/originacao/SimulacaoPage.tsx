import { useEffect, useLayoutEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { SimulacaoForm } from "@/features/originacao/components/SimulacaoForm";
import { SimulacaoList } from "@/features/originacao/components/SimulacaoList";
import { useOriginacao } from "@/features/originacao/originacao-context";
import type { SimulacaoSnapshot } from "@/features/originacao/types";

interface ShellContext {
  onMobileLogout?: () => void;
}

export function SimulacaoPage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();
  const {
    dadosIniciais,
    consumeDadosIniciais,
    simulacoes,
    addSimulacao,
    startProposal,
    setActiveTab,
    setSimulationFormOpen,
  } = useOriginacao();
  const [mode, setMode] = useState<"list" | "form">(
    dadosIniciais ? "form" : "list",
  );
  const [formKey, setFormKey] = useState(0);
  const [formPrefill, setFormPrefill] = useState(dadosIniciais);

  useEffect(() => {
    if (!dadosIniciais) return;
    setFormPrefill(dadosIniciais);
    setFormKey((key) => key + 1);
    setMode("form");
    consumeDadosIniciais();
  }, [dadosIniciais, consumeDadosIniciais]);

  useLayoutEffect(() => {
    setSimulationFormOpen(mode === "form");
    return () => setSimulationFormOpen(false);
  }, [mode, setSimulationFormOpen]);

  function handleNewSimulation() {
    setFormPrefill(null);
    setFormKey((key) => key + 1);
    setMode("form");
  }

  function handleCompleted(snapshot: SimulacaoSnapshot) {
    addSimulacao(snapshot);
    setMode("list");
  }

  function handleBack() {
    setMode("list");
    if (simulacoes.length === 0) {
      setActiveTab("elegibilidade");
    }
  }

  if (mode === "list") {
    return (
      <SimulacaoList
        simulations={simulacoes}
        onNewSimulation={handleNewSimulation}
        onStartProposal={startProposal}
      />
    );
  }

  return (
    <SimulacaoForm
      key={formKey}
      prefill={formPrefill}
      backLabel={
        simulacoes.length > 0
          ? "Voltar para a lista de simulações"
          : "Voltar para elegibilidade"
      }
      onBack={handleBack}
      onCompleted={handleCompleted}
      onLogout={onMobileLogout}
    />
  );
}

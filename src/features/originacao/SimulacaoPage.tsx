import { useEffect, useState } from "react";
import { SimulacaoForm } from "@/features/originacao/components/SimulacaoForm";
import { SimulacaoList } from "@/features/originacao/components/SimulacaoList";
import { useOriginacao } from "@/features/originacao/originacao-context";
import type { SimulacaoSnapshot } from "@/features/originacao/types";

export function SimulacaoPage() {
  const {
    dadosIniciais,
    consumeDadosIniciais,
    simulacoes,
    addSimulacao,
    startProposal,
  } = useOriginacao();
  const [mode, setMode] = useState<"list" | "form">(
    dadosIniciais ? "form" : "list",
  );
  const [formKey, setFormKey] = useState(0);
  const [formPrefill, setFormPrefill] = useState(dadosIniciais);

  useEffect(() => {
    if (dadosIniciais) consumeDadosIniciais();
  }, [dadosIniciais, consumeDadosIniciais]);

  function handleNewSimulation() {
    setFormPrefill(null);
    setFormKey((key) => key + 1);
    setMode("form");
  }

  function handleCompleted(snapshot: SimulacaoSnapshot) {
    addSimulacao(snapshot);
    setMode("list");
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
      hasList={simulacoes.length > 0}
      onViewList={() => setMode("list")}
      onCompleted={handleCompleted}
    />
  );
}

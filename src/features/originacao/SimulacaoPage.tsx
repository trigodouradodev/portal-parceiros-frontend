import { useState } from "react";
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
  const [blankFormKey, setBlankFormKey] = useState<number | null>(null);

  const fromEligibility = dadosIniciais != null;
  const showForm = fromEligibility || blankFormKey != null;
  const formKey = fromEligibility ? "prefill" : String(blankFormKey);

  function closeForm() {
    consumeDadosIniciais();
    setBlankFormKey(null);
  }

  function handleNewSimulation() {
    consumeDadosIniciais();
    setBlankFormKey((key) => (key ?? 0) + 1);
  }

  function handleCompleted(snapshot: SimulacaoSnapshot) {
    addSimulacao(snapshot);
    closeForm();
  }

  if (!showForm) {
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
      prefill={dadosIniciais}
      hasList={simulacoes.length > 0}
      onViewList={closeForm}
      onCompleted={handleCompleted}
    />
  );
}

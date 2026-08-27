import { useState } from "react";
import { SimulacaoForm } from "@/features/originacao/components/SimulacaoForm";
import { SimulacaoList } from "@/features/originacao/components/SimulacaoList";
import { useOriginacao } from "@/features/originacao/originacao-context";

export function SimulacaoPage() {
  const {
    dadosIniciais,
    consumeDadosIniciais,
    simulacoes,
    simulacoesLoading,
    simulacoesError,
    refetchSimulacoes,
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

  if (!showForm) {
    return (
      <SimulacaoList
        simulations={simulacoes}
        isLoading={simulacoesLoading}
        isError={simulacoesError}
        onRetry={refetchSimulacoes}
        onNewSimulation={handleNewSimulation}
        onStartProposal={startProposal}
      />
    );
  }

  return (
    <SimulacaoForm
      key={formKey}
      prefill={dadosIniciais}
      hasList={simulacoes.length > 0 || blankFormKey != null}
      onViewList={closeForm}
      onCompleted={closeForm}
    />
  );
}

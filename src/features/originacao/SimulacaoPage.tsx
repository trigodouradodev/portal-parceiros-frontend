import { useState } from "react";
import { SimulacaoForm } from "@/features/originacao/components/SimulacaoForm";
import { SimulacaoList } from "@/features/originacao/components/SimulacaoList";
import { useOriginacao } from "@/features/originacao/originacao-context";

export function SimulacaoPage() {
  const {
    eligibilityPrefill,
    clearEligibilityPrefill,
    simulations,
    startProposal,
  } = useOriginacao();
  const [blankFormKey, setBlankFormKey] = useState<number | null>(null);

  const fromEligibility = eligibilityPrefill != null;
  const showForm = fromEligibility || blankFormKey != null;
  const formKey = fromEligibility ? "prefill" : String(blankFormKey);

  function closeForm() {
    clearEligibilityPrefill();
    setBlankFormKey(null);
  }

  function handleNewSimulation() {
    clearEligibilityPrefill();
    setBlankFormKey((key) => (key ?? 0) + 1);
  }

  if (!showForm) {
    return (
      <SimulacaoList
        hasUnfilteredSimulations={simulations.length > 0}
        onNewSimulation={handleNewSimulation}
        onStartProposal={startProposal}
      />
    );
  }

  return (
    <SimulacaoForm
      key={formKey}
      prefill={eligibilityPrefill}
      hasList={simulations.length > 0 || blankFormKey != null}
      onViewList={closeForm}
      onCompleted={closeForm}
    />
  );
}

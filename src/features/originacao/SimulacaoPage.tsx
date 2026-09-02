import { useState } from "react";
import { SimulacaoForm } from "@/features/originacao/components/SimulacaoForm";
import { SimulacaoList } from "@/features/originacao/components/SimulacaoList";
import { useOriginacao } from "@/features/originacao/originacao-context";
import type { SimulationSnapshot } from "@/features/originacao/types";

export function SimulacaoPage() {
  const {
    eligibilityPrefill,
    clearEligibilityPrefill,
    simulations,
    startProposal,
  } = useOriginacao();
  const [blankFormKey, setBlankFormKey] = useState<number | null>(null);
  const [editing, setEditing] = useState<SimulationSnapshot | null>(null);

  const fromEligibility = eligibilityPrefill != null;
  const showForm = fromEligibility || blankFormKey != null || editing != null;
  const formKey = editing
    ? `edit-${editing.id}`
    : fromEligibility
      ? "prefill"
      : String(blankFormKey);

  function closeForm() {
    clearEligibilityPrefill();
    setBlankFormKey(null);
    setEditing(null);
  }

  function handleNewSimulation() {
    clearEligibilityPrefill();
    setEditing(null);
    setBlankFormKey((key) => (key ?? 0) + 1);
  }

  function handleEdit(snapshot: SimulationSnapshot) {
    clearEligibilityPrefill();
    setBlankFormKey(null);
    setEditing(snapshot);
  }

  if (!showForm) {
    return (
      <SimulacaoList
        hasUnfilteredSimulations={simulations.length > 0}
        onNewSimulation={handleNewSimulation}
        onEdit={handleEdit}
        onStartProposal={startProposal}
      />
    );
  }

  return (
    <SimulacaoForm
      key={formKey}
      prefill={eligibilityPrefill}
      editing={editing}
      hasList={
        simulations.length > 0 || blankFormKey != null || editing != null
      }
      onViewList={closeForm}
      onCompleted={closeForm}
    />
  );
}

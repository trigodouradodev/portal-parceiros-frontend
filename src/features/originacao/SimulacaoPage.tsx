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
    iniciarProposta,
  } = useOriginacao();
  const [mode, setMode] = useState<"lista" | "form">(
    dadosIniciais ? "form" : "lista",
  );
  const [formKey, setFormKey] = useState(0);
  const [formPrefill, setFormPrefill] = useState(dadosIniciais);

  useEffect(() => {
    if (dadosIniciais) consumeDadosIniciais();
  }, [dadosIniciais, consumeDadosIniciais]);

  function handleNovaSimulacao() {
    setFormPrefill(null);
    setFormKey((key) => key + 1);
    setMode("form");
  }

  function handleConcluida(snapshot: SimulacaoSnapshot) {
    addSimulacao(snapshot);
    setMode("lista");
  }

  if (mode === "lista") {
    return (
      <SimulacaoList
        simulacoes={simulacoes}
        onNovaSimulacao={handleNovaSimulacao}
        onIniciarProposta={iniciarProposta}
      />
    );
  }

  return (
    <SimulacaoForm
      key={formKey}
      prefill={formPrefill}
      hasLista={simulacoes.length > 0}
      onVerLista={() => setMode("lista")}
      onConcluida={handleConcluida}
    />
  );
}

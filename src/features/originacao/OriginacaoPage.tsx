import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { OriginacaoTabButton } from "@/features/originacao/components/OriginacaoTabButton";
import { ElegibilidadePage } from "@/features/originacao/ElegibilidadePage";
import { OriginacaoProvider } from "@/features/originacao/OriginacaoProvider";
import { useOriginacao } from "@/features/originacao/originacao-context";
import { PropostaPage } from "@/features/originacao/PropostaPage";
import { SimulacaoPage } from "@/features/originacao/SimulacaoPage";
import type { OriginacaoTab } from "@/features/originacao/types";

interface ShellContext {
  onMobileLogout?: () => void;
}

function OriginacaoTabs() {
  const { activeTab, setActiveTab, propostaSimulacao } = useOriginacao();
  const propostaLocked = propostaSimulacao == null;

  function goTo(tab: OriginacaoTab) {
    if (tab === "proposta" && propostaLocked) return;
    setActiveTab(tab);
  }

  return (
    <>
      <div className="px-5 pt-5 md:px-8">
        <div className="flex gap-1 rounded-xl bg-[#EBEBF0] p-1 md:w-[26rem]">
          <OriginacaoTabButton
            label="Elegibilidade"
            active={activeTab === "elegibilidade"}
            onClick={() => goTo("elegibilidade")}
          />
          <OriginacaoTabButton
            label="Simulação"
            active={activeTab === "simulacao"}
            onClick={() => goTo("simulacao")}
          />
          <OriginacaoTabButton
            label="Proposta"
            active={activeTab === "proposta"}
            disabled={propostaLocked}
            locked={propostaLocked}
            onClick={() => goTo("proposta")}
          />
        </div>
      </div>

      {activeTab === "elegibilidade" ? <ElegibilidadePage /> : null}
      {activeTab === "simulacao" ? <SimulacaoPage /> : null}
      {activeTab === "proposta" ? <PropostaPage /> : null}
    </>
  );
}

export function OriginacaoPage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();

  return (
    <OriginacaoProvider>
      <PageContainer>
        <PageHeader onLogout={onMobileLogout} />
        <OriginacaoTabs />
      </PageContainer>
    </OriginacaoProvider>
  );
}

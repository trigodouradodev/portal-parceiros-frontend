import { Lock } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  function goTo(tab: string) {
    if (tab === "proposta" && propostaLocked) return;
    setActiveTab(tab as OriginacaoTab);
  }

  return (
    <Tabs value={activeTab} onValueChange={goTo}>
      <div className="px-5 pt-5 md:px-8">
        <TabsList className="md:w-[26rem]">
          <TabsTrigger value="elegibilidade">Elegibilidade</TabsTrigger>
          <TabsTrigger value="simulacao">Simulação</TabsTrigger>
          <TabsTrigger
            value="proposta"
            disabled={propostaLocked}
            title={
              propostaLocked
                ? "Conclua uma simulação para liberar a proposta"
                : undefined
            }
            className="disabled:cursor-not-allowed disabled:opacity-100 disabled:text-[#C8CBD8]"
          >
            {propostaLocked ? <Lock size={12} aria-hidden /> : null}
            Proposta
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="elegibilidade" className="mt-0">
        <ElegibilidadePage />
      </TabsContent>
      <TabsContent value="simulacao" className="mt-0">
        <SimulacaoPage />
      </TabsContent>
      <TabsContent value="proposta" className="mt-0">
        <PropostaPage />
      </TabsContent>
    </Tabs>
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

import { useEffect } from "react";
import { Lock } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/shell-context";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElegibilidadePage } from "@/features/originacao/ElegibilidadePage";
import { OriginacaoProvider } from "@/features/originacao/OriginacaoProvider";
import { useOriginacao } from "@/features/originacao/originacao-context";
import { PropostaPage } from "@/features/originacao/PropostaPage";
import { SimulacaoPage } from "@/features/originacao/SimulacaoPage";
import type { OriginacaoTab } from "@/features/originacao/types";

function OriginacaoLayout() {
  const { onMobileLogout, setHideBottomNav } =
    useOutletContext<AppShellOutletContext>();
  const { activeTab, setActiveTab, simulations, openProposalId } =
    useOriginacao();
  const proposalLocked = simulations.length === 0;
  const focusedProposal = Boolean(openProposalId);

  useEffect(() => {
    setHideBottomNav?.(focusedProposal);
    return () => setHideBottomNav?.(false);
  }, [focusedProposal, setHideBottomNav]);

  function goTo(tab: string) {
    if (tab === "proposal" && proposalLocked) return;
    setActiveTab(tab as OriginacaoTab);
  }

  return (
    <PageContainer
      withBottomNav={!focusedProposal}
      className={
        focusedProposal ? "min-h-0 min-w-0 overflow-hidden" : undefined
      }
    >
      {focusedProposal ? null : <PageHeader onLogout={onMobileLogout} />}
      <Tabs
        value={activeTab}
        onValueChange={goTo}
        className={
          focusedProposal ? "flex min-h-0 min-w-0 flex-1 flex-col" : undefined
        }
      >
        {focusedProposal ? null : (
          <div className="px-5 pt-5 md:px-8">
            <TabsList className="md:w-[26rem]">
              <TabsTrigger value="eligibility">Elegibilidade</TabsTrigger>
              <TabsTrigger value="simulation">Simulação</TabsTrigger>
              <TabsTrigger
                value="proposal"
                disabled={proposalLocked}
                title={
                  proposalLocked
                    ? "Conclua uma simulação para liberar a proposta"
                    : undefined
                }
                className="disabled:cursor-not-allowed disabled:opacity-100 disabled:text-muted-foreground/50"
              >
                {proposalLocked ? <Lock size={12} aria-hidden /> : null}
                Proposta
              </TabsTrigger>
            </TabsList>
          </div>
        )}

        <TabsContent value="eligibility" className="mt-0">
          <ElegibilidadePage />
        </TabsContent>
        <TabsContent value="simulation" className="mt-0">
          <SimulacaoPage />
        </TabsContent>
        <TabsContent
          value="proposal"
          className={
            focusedProposal
              ? "mt-0 flex min-h-0 min-w-0 flex-1 flex-col"
              : "mt-0"
          }
        >
          <PropostaPage />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

export function OriginacaoPage() {
  return (
    <OriginacaoProvider>
      <OriginacaoLayout />
    </OriginacaoProvider>
  );
}

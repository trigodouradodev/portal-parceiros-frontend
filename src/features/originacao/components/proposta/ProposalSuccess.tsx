import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { OriginacaoTaskHeader } from "@/features/originacao/components/OriginacaoTaskHeader";
import { originacaoCardClassName } from "@/features/originacao/components/OriginacaoPageFrame";
import type { ProposalSnapshot } from "@/features/originacao/data/proposal";
import { fmtBRL } from "@/lib/utils";

export function ProposalSuccess({
  proposal,
  onBackToList,
  onLogout,
}: {
  proposal: ProposalSnapshot;
  onBackToList: () => void;
  onLogout?: () => void;
}) {
  const { simulation } = proposal;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto">
      <OriginacaoTaskHeader
        title="Proposta criada"
        subtitle={`${fmtBRL(simulation.valor)} · ${simulation.parcelas}x · ${simulation.produto}`}
        backLabel="Ver todas as propostas"
        onBack={onBackToList}
        onLogout={onLogout}
      />

      <div className="px-5 pt-4 pb-8 md:px-8">
        <section className={originacaoCardClassName}>
          <div className="flex flex-col gap-3">
            <Alert variant="success">
              <CheckCircle2 size={22} />
              <div>
                <AlertTitle>Proposta criada</AlertTitle>
                <AlertDescription>
                  O cliente deve acessar o Portal do Cliente para revisar os
                  dados, dar os consentimentos e concluir a aprovação.
                </AlertDescription>
              </div>
            </Alert>

            <WhatsAppButton
              size="pill"
              className="w-full py-3.5"
              showExternalIcon
              onClick={() =>
                alert("Abrirá o WhatsApp com o link do Portal do Cliente.")
              }
            >
              Enviar link pelo WhatsApp
            </WhatsAppButton>

            <Button variant="ghost" size="pill" onClick={onBackToList}>
              Ver todas as propostas
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

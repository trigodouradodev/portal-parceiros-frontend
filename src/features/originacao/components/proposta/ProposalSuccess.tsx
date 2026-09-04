import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { OriginacaoTaskHeader } from "@/features/originacao/components/OriginacaoTaskHeader";
import { originacaoCardClassName } from "@/features/originacao/components/OriginacaoPageFrame";
import type { ProposalSnapshot } from "@/features/originacao/data/proposal";
import { hasCallablePhone, openWhatsApp } from "@/lib/contact-actions";
import { fmtBRL } from "@/lib/utils";

function buildProposalWhatsAppMessage(clientName: string): string {
  const firstName = clientName.split(" ")[0] ?? clientName;
  return `Olá, ${firstName}! Sua proposta na Aurea foi criada. Acesse o Portal do Cliente para revisar os dados, dar os consentimentos e concluir a aprovação.`;
}

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
  const phone = simulation.telephone;
  const canSendWhatsApp = hasCallablePhone(phone);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto">
      <OriginacaoTaskHeader
        title="Proposta criada"
        subtitle={`${fmtBRL(simulation.amount)} · ${simulation.installments}x · ${simulation.productName}`}
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
              disabled={!canSendWhatsApp}
              onClick={() =>
                openWhatsApp(phone, buildProposalWhatsAppMessage(simulation.name))
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

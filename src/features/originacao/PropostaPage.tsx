import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { OriginacaoProgress } from "@/features/originacao/components/OriginacaoProgress";
import { ActivityIncomeSection } from "@/features/originacao/components/proposta/ActivityIncomeSection";
import { AddressSection } from "@/features/originacao/components/proposta/AddressSection";
import { DocumentsSection } from "@/features/originacao/components/proposta/DocumentsSection";
import { FinancialSection } from "@/features/originacao/components/proposta/FinancialSection";
import { GuarantorSection } from "@/features/originacao/components/proposta/GuarantorSection";
import { PartnerOpinionSection } from "@/features/originacao/components/proposta/PartnerOpinionSection";
import { ProposalTaskHeader } from "@/features/originacao/components/proposta/ProposalTaskHeader";
import { RegistrationSection } from "@/features/originacao/components/proposta/RegistrationSection";
import { useOriginacao } from "@/features/originacao/originacao-context";
import {
  PROPOSAL_STEPS,
  isActivityIncomeValid,
  isAddressValid,
  isDocumentsValid,
  isFinancialValid,
  isGuarantorValid,
  isPartnerOpinionValid,
  isRegistrationValid,
  type ProposalFormData,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { getProposalStepFieldErrors } from "@/features/originacao/utils/proposal-step-errors";
import { scrollToField } from "@/features/originacao/utils/scroll-to-first-error";
import { formatCpf } from "@/lib/format/tax-id";
import { fmtBRL } from "@/lib/utils";

interface ShellContext {
  onMobileLogout?: () => void;
}

function ProposalList({
  proposals,
  onOpen,
}: {
  proposals: ProposalSnapshot[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <div className="mb-6">
        <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
          Propostas
        </h2>
        <p className="mt-1 text-sm text-[#6B7080]">
          Propostas criadas nesta sessão — rascunhos podem ser retomados a
          qualquer momento.
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F6FA]">
            <FileText size={22} className="text-[#9DA3B4]" />
          </div>
          <p className="mb-1 font-semibold text-[#1A1D2E]">
            Nenhuma proposta ainda
          </p>
          <p className="text-sm text-[#9DA3B4]">
            Inicie uma proposta a partir de uma simulação concluída.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {[...proposals].reverse().map((proposal) => (
          <div
            key={proposal.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#E2E4EC] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  proposal.status === "draft"
                    ? "bg-[#FDF3E0] text-[#854F0B]"
                    : "bg-[#E6F7F1] text-[#0F6E56]"
                }`}
              >
                {proposal.status === "draft" ? "Rascunho" : "Concluída"}
              </span>
              <span className="shrink-0 text-xs text-[#9DA3B4]">
                {proposal.updatedAt}
              </span>
            </div>
            <div>
              <p className="font-fraunces text-base font-bold text-[#1A1D2E]">
                {proposal.simulation.nome}
              </p>
              <p className="font-fraunces text-lg font-bold text-[#1A1D2E]">
                {fmtBRL(proposal.simulation.valor)}
              </p>
              <p className="text-sm text-[#6B7080]">
                {proposal.simulation.parcelas}x de{" "}
                {fmtBRL(proposal.simulation.parcelaCalc)}
              </p>
              <p className="mt-1 text-xs text-[#9DA3B4]">
                CPF {formatCpf(proposal.simulation.cpf)}
              </p>
            </div>
            {proposal.status === "draft" ? (
              <>
                <OriginacaoProgress
                  value={((proposal.step + 1) / PROPOSAL_STEPS.length) * 100}
                />
                <p className="text-xs text-[#9DA3B4]">
                  Passo {proposal.step + 1} de {PROPOSAL_STEPS.length} ·{" "}
                  {PROPOSAL_STEPS[proposal.step]}
                </p>
                <Button
                  variant="outline"
                  className="h-10 rounded-2xl"
                  onClick={() => onOpen(proposal.id)}
                >
                  Continuar preenchimento
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="h-10 rounded-2xl"
                onClick={() => onOpen(proposal.id)}
              >
                Ver proposta
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalSuccess({
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
      <ProposalTaskHeader
        title="Proposta criada"
        simulation={simulation}
        backLabel="Ver todas as propostas"
        onBack={onBackToList}
        onLogout={onLogout}
      />

      <div className="px-5 pt-4 pb-8 md:px-8">
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
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

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-3.5 font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
              onClick={() =>
                alert("Abrirá o WhatsApp com o link do Portal do Cliente.")
              }
            >
              <MessageSquare size={18} />
              Enviar link pelo WhatsApp
              <ExternalLink size={14} className="opacity-70" />
            </button>

            <Button
              variant="ghost"
              className="h-11 rounded-2xl"
              onClick={onBackToList}
            >
              Ver todas as propostas
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function PropostaPage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();
  const {
    proposals,
    openProposalId,
    openProposal,
    closeProposal,
    updateProposal,
  } = useOriginacao();

  const proposal = openProposalId
    ? (proposals.find((item) => item.id === openProposalId) ?? null)
    : null;

  if (!proposal) {
    return <ProposalList proposals={proposals} onOpen={openProposal} />;
  }

  if (proposal.status === "completed") {
    return (
      <ProposalSuccess
        proposal={proposal}
        onBackToList={closeProposal}
        onLogout={onMobileLogout}
      />
    );
  }

  return (
    <ProposalWizard
      key={proposal.id}
      proposal={proposal}
      onUpdate={updateProposal}
      onClose={closeProposal}
      onLogout={onMobileLogout}
    />
  );
}

function ProposalWizard({
  proposal,
  onUpdate,
  onClose,
  onLogout,
}: {
  proposal: ProposalSnapshot;
  onUpdate: (proposal: ProposalSnapshot) => void;
  onClose: () => void;
  onLogout?: () => void;
}) {
  const form = useForm<ProposalFormData>({
    defaultValues: proposal.data,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const data = form.watch();
  const valuesKey = JSON.stringify(data);
  const { simulation, step } = proposal;
  const stepValid = [
    isRegistrationValid(data.registration),
    isActivityIncomeValid(data.activityIncome),
    isAddressValid(data.address),
    isPartnerOpinionValid(data.partnerOpinion),
    isGuarantorValid(data.guarantor),
    isFinancialValid(),
    isDocumentsValid(data.documents),
  ];

  useEffect(() => {
    if (!submitAttempted) return;
    const errors = getProposalStepFieldErrors(step, form.getValues());
    form.clearErrors();
    for (const item of errors) {
      form.setError(item.name, { type: "manual", message: item.message });
    }
    // Revalidates the current step after the first failed Avançar.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form methods are stable
  }, [step, submitAttempted, valuesKey]);

  function persist(patch: Partial<ProposalSnapshot> = {}) {
    onUpdate({
      ...proposal,
      data: form.getValues(),
      stepValid,
      updatedAt: new Date().toLocaleString("pt-BR"),
      ...patch,
    });
  }

  function handleNext() {
    const errors = getProposalStepFieldErrors(step, form.getValues());
    setSubmitAttempted(true);
    if (errors.length > 0) {
      form.clearErrors();
      for (const item of errors) {
        form.setError(item.name, { type: "manual", message: item.message });
      }
      scrollToField(errors[0].name);
      return;
    }
    setSubmitAttempted(false);
    form.clearErrors();
    if (step === PROPOSAL_STEPS.length - 1) {
      persist({ status: "completed" });
    } else {
      persist({ step: step + 1 });
    }
  }

  function handleBack() {
    setSubmitAttempted(false);
    form.clearErrors();
    persist({ step: Math.max(0, step - 1) });
  }

  function handleClose() {
    persist();
    onClose();
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <ProposalTaskHeader
        title={`${PROPOSAL_STEPS[step]} · ${step + 1}/${PROPOSAL_STEPS.length}`}
        simulation={simulation}
        progress={((step + 1) / PROPOSAL_STEPS.length) * 100}
        backLabel="Salvar rascunho e ver todas as propostas"
        onBack={handleClose}
        onLogout={onLogout}
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-5 pt-4 pb-4 md:px-8">
        <section className="mx-auto w-full min-w-0 max-w-2xl rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
          <Form {...form}>
            <div className={step === 0 ? "" : "hidden"}>
              <RegistrationSection
                product={simulation.produto}
                rate={simulation.taxa}
                cpf={simulation.cpf}
                name={simulation.nome}
                birthDate={simulation.nascimento}
                email={simulation.email}
                phone={simulation.celular}
              />
            </div>
            <div className={step === 1 ? "" : "hidden"}>
              <ActivityIncomeSection />
            </div>
            <div className={step === 2 ? "" : "hidden"}>
              <AddressSection />
            </div>
            <div className={step === 3 ? "" : "hidden"}>
              <PartnerOpinionSection />
            </div>
            <div className={step === 4 ? "" : "hidden"}>
              <GuarantorSection />
            </div>
            <div className={step === 5 ? "" : "hidden"}>
              <FinancialSection />
            </div>
            <div className={step === 6 ? "" : "hidden"}>
              <DocumentsSection />
            </div>
          </Form>
        </section>
      </div>

      <div className="shrink-0 border-t border-[#E2E4EC] bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8">
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          {step > 0 ? (
            <Button
              variant="outline"
              className="h-12 min-h-12 shrink-0 rounded-2xl px-6"
              onClick={handleBack}
            >
              Voltar
            </Button>
          ) : null}
          <Button
            variant="yellow"
            className="h-12 min-h-12 min-w-0 flex-1 rounded-2xl"
            onClick={handleNext}
          >
            {step === PROPOSAL_STEPS.length - 1
              ? "Concluir proposta"
              : "Avançar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

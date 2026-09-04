import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/shell-context";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/contexts/toast/toast-context";
import { OriginacaoTaskHeader } from "@/features/originacao/components/OriginacaoTaskHeader";
import { OriginacaoTaskLayout } from "@/features/originacao/components/OriginacaoTaskLayout";
import { ActivityIncomeSection } from "@/features/originacao/components/proposta/ActivityIncomeSection";
import { AddressSection } from "@/features/originacao/components/proposta/AddressSection";
import { DocumentsSection } from "@/features/originacao/components/proposta/DocumentsSection";
import { FinancialSection } from "@/features/originacao/components/proposta/FinancialSection";
import { GuarantorSection } from "@/features/originacao/components/proposta/GuarantorSection";
import { PartnerOpinionSection } from "@/features/originacao/components/proposta/PartnerOpinionSection";
import { ProposalList } from "@/features/originacao/components/proposta/ProposalList";
import { ProposalSuccess } from "@/features/originacao/components/proposta/ProposalSuccess";
import { RegistrationSection } from "@/features/originacao/components/proposta/RegistrationSection";
import { useSaveQuoteAddress } from "@/features/originacao/hooks/useSaveQuoteAddress";
import { useSaveQuoteFinancial } from "@/features/originacao/hooks/useSaveQuoteFinancial";
import { useSaveQuoteGuarantor } from "@/features/originacao/hooks/useSaveQuoteGuarantor";
import { useSaveQuoteIncome } from "@/features/originacao/hooks/useSaveQuoteIncome";
import { useSaveQuotePartnerOpinion } from "@/features/originacao/hooks/useSaveQuotePartnerOpinion";
import { useSaveQuoteRegistration } from "@/features/originacao/hooks/useSaveQuoteRegistration";
import { useCompleteQuoteDocumentation } from "@/features/originacao/hooks/useQuoteDocumentation";
import { useOriginacao } from "@/features/originacao/originacao-context";
import { productRatePercent } from "@/features/originacao/data/simulacao";
import {
  PROPOSAL_STEPS,
  type ProposalFormData,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { getApiErrorMessage } from "@/lib/api/errors";
import { AvailableIncomeProof } from "@/services/quotes/quotes.enums";
import {
  isActivityIncomeValid,
  isAddressValid,
  isDocumentsValid,
  isFinancialValid,
  isGuarantorValid,
  isPartnerOpinionValid,
  isRegistrationValid,
} from "@/features/originacao/schemas/proposal-form";
import { getProposalStepFieldErrors } from "@/features/originacao/utils/proposal-step-errors";
import {
  scrollTaskToTop,
  scrollToField,
} from "@/features/originacao/utils/scroll-to-first-error";
import { fmtBRL } from "@/lib/utils";

export function PropostaPage() {
  const { onMobileLogout } = useOutletContext<AppShellOutletContext>();
  const {
    proposals,
    openProposalId,
    openingProposalId,
    openProposal,
    closeProposal,
    updateProposal,
  } = useOriginacao();

  const proposal = openProposalId
    ? (proposals.find((item) => item.id === openProposalId) ?? null)
    : null;

  if (!openProposalId) {
    return <ProposalList onOpen={openProposal} openingId={openingProposalId} />;
  }

  if (!proposal) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        Carregando proposta…
      </div>
    );
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
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { showToast } = useToast();
  const { mutateAsync: saveRegistration, isPending: savingRegistration } =
    useSaveQuoteRegistration();
  const { mutateAsync: saveIncome, isPending: savingIncome } =
    useSaveQuoteIncome();
  const { mutateAsync: saveAddress, isPending: savingAddress } =
    useSaveQuoteAddress();
  const { mutateAsync: savePartnerOpinion, isPending: savingPartnerOpinion } =
    useSaveQuotePartnerOpinion();
  const { mutateAsync: saveGuarantor, isPending: savingGuarantor } =
    useSaveQuoteGuarantor();
  const { mutateAsync: saveFinancial, isPending: savingFinancial } =
    useSaveQuoteFinancial();
  const {
    mutateAsync: completeDocumentation,
    isPending: completingDocumentation,
  } = useCompleteQuoteDocumentation();
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const savingStep =
    savingRegistration ||
    savingIncome ||
    savingAddress ||
    savingPartnerOpinion ||
    savingGuarantor ||
    savingFinancial ||
    completingDocumentation;

  const data = form.watch();
  const { simulation, step } = proposal;

  function computeStepValid(values: ProposalFormData) {
    const incomeProofRequired =
      values.activityIncome.availableProof !== AvailableIncomeProof.NONE;
    return [
      isRegistrationValid(values.registration),
      isActivityIncomeValid(values.activityIncome),
      isAddressValid(values.address),
      isPartnerOpinionValid(values.partnerOpinion),
      isGuarantorValid(values.guarantor),
      isFinancialValid(),
      isDocumentsValid(values.documents, incomeProofRequired),
    ];
  }

  useEffect(() => {
    if (!submitAttempted) return;
    const errors = getProposalStepFieldErrors(step, form.getValues());
    form.clearErrors();
    for (const item of errors) {
      form.setError(item.name, { type: "manual", message: item.message });
    }
    // Revalida o passo atual depois do primeiro Avançar.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form methods are stable
  }, [step, submitAttempted, data]);

  useEffect(() => {
    scrollTaskToTop();
  }, [step]);

  function persist(patch: Partial<ProposalSnapshot> = {}) {
    const values = form.getValues();
    onUpdate({
      ...proposal,
      data: values,
      stepValid: computeStepValid(values),
      updatedAt: new Date().toLocaleString("pt-BR"),
      ...patch,
    });
  }

  function applyStepErrors() {
    const errors = getProposalStepFieldErrors(step, form.getValues());
    form.clearErrors();
    for (const item of errors) {
      form.setError(item.name, { type: "manual", message: item.message });
    }
    return errors;
  }

  async function handleNext() {
    const errors = applyStepErrors();
    setSubmitAttempted(true);
    if (errors.length > 0) {
      scrollToField(errors[0].name);
      return;
    }
    if (step === 0) {
      try {
        await saveRegistration({
          quoteId: proposal.id,
          registration: form.getValues().registration,
        });
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível salvar o cadastro."),
          { variant: "destructive" },
        );
        return;
      }
    }
    if (step === 1) {
      try {
        await saveIncome({
          quoteId: proposal.id,
          activityIncome: form.getValues().activityIncome,
        });
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível salvar atividade e renda."),
          { variant: "destructive" },
        );
        return;
      }
    }
    if (step === 2) {
      try {
        await saveAddress({
          quoteId: proposal.id,
          address: form.getValues().address,
        });
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível salvar o endereço."),
          { variant: "destructive" },
        );
        return;
      }
    }
    if (step === 3) {
      try {
        await savePartnerOpinion({
          quoteId: proposal.id,
          partnerOpinion: form.getValues().partnerOpinion,
        });
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível salvar o parecer."),
          { variant: "destructive" },
        );
        return;
      }
    }
    if (step === 4) {
      try {
        await saveGuarantor({
          quoteId: proposal.id,
          guarantor: form.getValues().guarantor,
        });
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível salvar o avalista."),
          { variant: "destructive" },
        );
        return;
      }
    }
    if (step === 5) {
      try {
        await saveFinancial({
          quoteId: proposal.id,
          financial: form.getValues().financial,
        });
      } catch (err) {
        const message = isAxiosError(err)
          ? getApiErrorMessage(err, "Não foi possível salvar o financeiro.")
          : err instanceof Error
            ? err.message
            : "Não foi possível salvar o financeiro.";
        showToast(message, { variant: "destructive" });
        return;
      }
    }
    if (step === 6) {
      try {
        await completeDocumentation(proposal.id);
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível concluir a documentação."),
          { variant: "destructive" },
        );
        return;
      }
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
    <OriginacaoTaskLayout
      header={
        <OriginacaoTaskHeader
          title={`${PROPOSAL_STEPS[step]} · ${step + 1}/${PROPOSAL_STEPS.length}`}
          subtitle={`${fmtBRL(simulation.amount)} · ${simulation.installments}x · ${simulation.productName}`}
          progress={((step + 1) / PROPOSAL_STEPS.length) * 100}
          backLabel="Salvar rascunho e ver todas as propostas"
          onBack={handleClose}
          onLogout={onLogout}
        />
      }
    >
      <Form {...form}>
        <form
          className="flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            handleNext();
          }}
          noValidate
        >
          {step === 0 ? (
            <RegistrationSection
              product={simulation.productName}
              rate={productRatePercent({
                maxInterestRate: simulation.interestRate,
              })}
              cpf={simulation.document}
              name={simulation.name}
              birthDate={simulation.birthDate}
              email={simulation.email}
              phone={simulation.telephone}
            />
          ) : null}
          {step === 1 ? <ActivityIncomeSection /> : null}
          {step === 2 ? <AddressSection /> : null}
          {step === 3 ? <PartnerOpinionSection /> : null}
          {step === 4 ? <GuarantorSection /> : null}
          {step === 5 ? <FinancialSection /> : null}
          {step === 6 ? <DocumentsSection quoteId={proposal.id} /> : null}

          <div className="mt-6 flex gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="pill"
                className="shrink-0 px-6"
                onClick={handleBack}
                disabled={savingStep}
              >
                Voltar
              </Button>
            ) : null}
            <Button
              type="submit"
              variant="yellow"
              size="pill"
              className="min-w-0 flex-1"
              disabled={savingStep}
            >
              {step === PROPOSAL_STEPS.length - 1
                ? "Concluir proposta"
                : "Avançar"}
            </Button>
          </div>
        </form>
      </Form>
    </OriginacaoTaskLayout>
  );
}

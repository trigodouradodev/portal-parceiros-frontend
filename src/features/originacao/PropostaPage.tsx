import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/shell-context";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { useApplyRenewalPrefill } from "@/features/originacao/hooks/useApplyRenewalPrefill";
import { useEmailDeliverability } from "@/features/originacao/hooks/useEmailDeliverability";
import {
  useCompleteQuoteDocumentation,
  useSubmitQuoteDraft,
} from "@/features/originacao/hooks/useQuoteDocumentation";
import { useOriginacao } from "@/features/originacao/originacao-context";
import { productRatePercent } from "@/features/originacao/data/simulacao";
import {
  OTHER_OPTION,
  PROPOSAL_STEPS,
  applyRegistrationIdentityToSimulation,
  requiresProfession,
  type ProposalFormData,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getBackofficeQuoteUrl } from "@/lib/backoffice";
import { QuoteStatus } from "@/services/quotes/quotes.enums";
import { isQuoteInBackoffice } from "@/services/quotes/quotes.status";
import {
  isActivityIncomeValid,
  isAddressValid,
  isDocumentsValid,
  isFinancialValid,
  isGuarantorValid,
  isPartnerOpinionValid,
  isRegistrationValid,
} from "@/features/originacao/schemas/proposal-form";
import { getBlockedEmailField } from "@/features/originacao/utils/email-confirmation-gate";
import { getProposalStepFieldErrors } from "@/features/originacao/utils/proposal-step-errors";
import { mergeRenewalPrefillIntoForm } from "@/features/originacao/mappers/map-quote-detail-to-form";
import {
  scrollTaskToTop,
  scrollToField,
} from "@/features/originacao/utils/scroll-to-first-error";
import { fmtBRL } from "@/lib/utils";
import { parseMoneyBrl } from "@/lib/format/money";

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

  if (proposal.status === QuoteStatus.CLIENT_REVIEW) {
    return (
      <ProposalSuccess
        proposal={proposal}
        onBackToList={closeProposal}
        onLogout={onMobileLogout}
      />
    );
  }

  if (isQuoteInBackoffice(proposal.status)) {
    return (
      <OpenBackofficeQuote quoteId={proposal.id} onClose={closeProposal} />
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

function OpenBackofficeQuote({
  quoteId,
  onClose,
}: {
  quoteId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    window.open(
      getBackofficeQuoteUrl(quoteId),
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  }, [quoteId, onClose]);

  return (
    <div className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
      Abrindo proposta no backoffice…
    </div>
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
  const {
    mutateAsync: applyRenewalPrefill,
    isPending: applyingRenewalPrefill,
  } = useApplyRenewalPrefill();
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
  const { mutateAsync: submitDraft, isPending: submittingDraft } =
    useSubmitQuoteDraft();
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [renewalPrefillOpen, setRenewalPrefillOpen] = useState(false);
  const [blockedEmailField, setBlockedEmailField] = useState<
    "registration.email" | "guarantor.email" | null
  >(null);
  const savingStep =
    applyingRenewalPrefill ||
    savingRegistration ||
    savingIncome ||
    savingAddress ||
    savingPartnerOpinion ||
    savingGuarantor ||
    savingFinancial ||
    completingDocumentation ||
    submittingDraft;

  function handleRenewalChange(value: boolean) {
    if (value) setRenewalPrefillOpen(true);
  }

  function handleRenewalPrefillCancel() {
    form.setValue("registration.isRenewal", false, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function handleRenewalPrefill() {
    try {
      const result = await applyRenewalPrefill(proposal.id);
      const nextData = mergeRenewalPrefillIntoForm(
        form.getValues(),
        result.quote,
      );
      form.reset(nextData);
      onUpdate({
        ...proposal,
        data: nextData,
        stepValid: computeStepValid(nextData),
        updatedAt: new Date().toLocaleString("pt-BR"),
      });
      showToast(
        result.applied
          ? "Dados da última proposta copiados. Confira cada etapa antes de avançar."
          : "Os dados da renovação já haviam sido copiados.",
      );
    } catch {
      showToast(
        "Não foi possível copiar os dados da última proposta. Preencha os campos manualmente.",
        { variant: "destructive" },
      );
    }
  }

  const data = form.watch();
  const { simulation, step } = proposal;
  // Só consulta a ZeroBounce enquanto o parceiro está de fato no step que
  // tem o campo de e-mail correspondente — evita gastar cota paga a cada
  // vez que o wizard remonta (abrir a lista e voltar pra mesma proposta,
  // por exemplo) enquanto o parceiro está em outro step qualquer.
  const emailDeliverability = useEmailDeliverability(
    step === 0 ? data.registration.email : undefined,
  );
  const guarantorEmailDeliverability = useEmailDeliverability(
    step === 4 ? data.guarantor.email : undefined,
  );

  function computeStepValid(values: ProposalFormData) {
    const subcategoryValid =
      values.registration.businessActivityBranch.trim() === "" ||
      values.registration.businessActivitySubcategory.trim() !== "";
    const activityCategoryOtherValid =
      !values.registration.activityCategories.includes(OTHER_OPTION) ||
      values.registration.activityCategoryOther.trim() !== "";
    const occupationValid =
      !requiresProfession(values.registration.activityCategories) ||
      values.registration.occupation.trim().length >= 2;
    return [
      isRegistrationValid(values.registration),
      isActivityIncomeValid(values.activityIncome) &&
        values.registration.activityCategories.length > 0 &&
        activityCategoryOtherValid &&
        occupationValid &&
        values.registration.businessActivityBranch.trim() !== "" &&
        subcategoryValid,
      isAddressValid(values.address),
      isPartnerOpinionValid(values.partnerOpinion),
      isGuarantorValid(values.guarantor),
      isFinancialValid(values.financial),
      isDocumentsValid(values.documents),
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
      simulation: applyRegistrationIdentityToSimulation(
        proposal.simulation,
        values.registration,
      ),
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

    const blockedField = getBlockedEmailField(
      step,
      emailDeliverability.status,
      guarantorEmailDeliverability.status,
    );
    if (blockedField) {
      setBlockedEmailField(blockedField);
      return;
    }

    await proceedAfterEmailCheck();
  }

  async function proceedAfterEmailCheck() {
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
        const values = form.getValues();
        await saveIncome({
          quoteId: proposal.id,
          activityIncome: values.activityIncome,
          registration: values.registration,
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
        const values = form.getValues();
        await saveIncome({
          quoteId: proposal.id,
          activityIncome: values.activityIncome,
          registration: values.registration,
        });
        await savePartnerOpinion({
          quoteId: proposal.id,
          partnerOpinion: values.partnerOpinion,
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
      const values = form.getValues();
      const consideredIncome =
        parseMoneyBrl(values.activityIncome.monthlyIncome) +
        values.activityIncome.additionalIncomes
          .filter((income) => income.source !== "family_income")
          .reduce((total, income) => total + parseMoneyBrl(income.amount), 0);
      const committedAmount =
        values.financial.expenses.reduce(
          (total, expense) => total + parseMoneyBrl(expense.amount),
          0,
        ) +
        values.financial.loans.reduce(
          (total, loan) => total + parseMoneyBrl(loan.installmentAmount),
          0,
        );
      const availableForInstallment = consideredIncome - committedAmount;

      if (availableForInstallment < proposal.simulation.installmentAmount) {
        showToast(
          `A parcela de ${fmtBRL(proposal.simulation.installmentAmount)} excede o montante disponível de ${fmtBRL(availableForInstallment)}. Ajuste as rendas, despesas, empréstimos ou a simulação para continuar.`,
          { variant: "destructive" },
        );
        return;
      }

      try {
        await saveFinancial({
          quoteId: proposal.id,
          financial: values.financial,
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
        await submitDraft(proposal.id);
      } catch (err) {
        showToast(
          getApiErrorMessage(err, "Não foi possível enviar a proposta."),
          { variant: "destructive" },
        );
        return;
      }
    }
    setSubmitAttempted(false);
    form.clearErrors();
    if (step === PROPOSAL_STEPS.length - 1) {
      persist({ status: QuoteStatus.CLIENT_REVIEW });
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

  function handleBlockedEmailOpenChange(open: boolean) {
    if (!open) setBlockedEmailField(null);
  }

  async function handleBlockedEmailConfirm() {
    setBlockedEmailField(null);
    await proceedAfterEmailCheck();
  }

  function handleBlockedEmailCancel() {
    if (blockedEmailField) scrollToField(blockedEmailField);
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
              onRenewalChange={handleRenewalChange}
              emailDeliverabilityStatus={emailDeliverability.status}
            />
          ) : null}
          {step === 1 ? <ActivityIncomeSection /> : null}
          {step === 2 ? <AddressSection /> : null}
          {step === 3 ? <PartnerOpinionSection /> : null}
          {step === 4 ? (
            <GuarantorSection
              emailDeliverabilityStatus={guarantorEmailDeliverability.status}
            />
          ) : null}
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
      <ConfirmDialog
        open={renewalPrefillOpen}
        onOpenChange={setRenewalPrefillOpen}
        title="Continuar com a renovação?"
        description="Ao continuar, copiaremos automaticamente os dados de Cadastro, Atividade e renda e Endereço da última proposta desembolsada ou quitada deste tomador. Os dados da nova simulação serão mantidos e você poderá conferir os campos antes de avançar."
        confirmLabel="Continuar"
        cancelLabel="Cancelar"
        onConfirm={handleRenewalPrefill}
        onCancel={handleRenewalPrefillCancel}
        pending={applyingRenewalPrefill}
        pendingLabel="Copiando…"
      />
      <ConfirmDialog
        open={blockedEmailField !== null}
        onOpenChange={handleBlockedEmailOpenChange}
        title="E-mail pode não ser entregável"
        description="Este e-mail não passou na verificação de entregabilidade — pode haver um erro de digitação, ou o servidor do destinatário pode estar recusando mensagens. Quer continuar mesmo assim?"
        confirmLabel="Continuar assim mesmo"
        cancelLabel="Corrigir e-mail"
        onConfirm={handleBlockedEmailConfirm}
        onCancel={handleBlockedEmailCancel}
      />
    </OriginacaoTaskLayout>
  );
}

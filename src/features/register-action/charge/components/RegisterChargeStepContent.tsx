import type { ReactNode } from "react";
import { OutcomeOptionList } from "@/features/register-action";
import type { useRegisterChargeActionFlow } from "@/features/register-action/charge/hooks/useRegisterChargeActionFlow";
import { WhatsAppPanel } from "@/features/register-action/preventive/components";
import { ActivityInteractionResult } from "@/services/activities/activity.enums";
import { ChargePhoneStep } from "./ChargePhoneStep";
import { ChargeVisitStep } from "./ChargeVisitStep";
import { ContactToneBadges } from "./ContactToneBadges";
import { PromiseDateSummary } from "./PromiseDateSummary";
import { RecipientPicker } from "./RecipientPicker";

type Flow = ReturnType<typeof useRegisterChargeActionFlow>;

interface RegisterChargeStepContentProps {
  flow: Flow;
}

export function RegisterChargeStepContent({
  flow,
}: RegisterChargeStepContentProps) {
  const {
    step,
    client,
    guarantor,
    contactType,
    isVisitTask,
    queueTone,
    recipientType,
    setRecipientType,
    outcome,
    note,
    setNote,
    promiseDate,
    outcomeOptions,
    contactPhone,
    contactFirstName,
    contactAddress,
    addressLabel,
    phoneLabel,
    visitScript,
    callScript,
    outcomePrompt,
    waTemplates,
    location,
    noteRequired,
    showNoteValidation,
    selectOutcome,
    openPromiseDateEditor,
  } = flow;

  if (!client) return null;

  if (step === "recipient") {
    return (
      <RecipientPicker
        value={recipientType}
        onChange={setRecipientType}
        clientName={client.name}
        clientPhone={client.phone}
        guarantor={guarantor}
        requireAddressForGuarantor={isVisitTask}
      />
    );
  }

  if (step === "contact" && contactType === "whatsapp") {
    return (
      <div className="flex flex-col gap-4">
        <ContactToneBadges queueTone={queueTone} variant="withDescription" />
        <WhatsAppPanel
          phone={contactPhone}
          clientFirstName={contactFirstName}
          templates={waTemplates}
        />
      </div>
    );
  }

  if (step === "contact" && contactType === "phone") {
    return (
      <ChargePhoneStep
        queueTone={queueTone}
        phone={contactPhone}
        phoneLabel={phoneLabel}
        contactFirstName={contactFirstName}
        callScript={callScript}
      />
    );
  }

  if (step === "contact" && contactType === "visit") {
    return (
      <ChargeVisitStep
        queueTone={queueTone}
        address={contactAddress}
        addressLabel={addressLabel}
        orientationScript={visitScript}
        status={location.status}
        locationCheckResult={location.result}
        onVerifyLocation={location.verify}
        onConfirmManual={location.confirmManual}
      />
    );
  }

  if (step === "outcome") {
    const showPromiseSummary =
      outcome === ActivityInteractionResult.PAYMENT_PROMISE &&
      Boolean(promiseDate);

    let noteHint: string | undefined;
    if (showNoteValidation) {
      noteHint = "Descreva o motivo nas observações para poder registrar.";
    }

    let afterOptions: ReactNode;
    if (showPromiseSummary && promiseDate) {
      afterOptions = (
        <PromiseDateSummary
          date={promiseDate}
          onChange={openPromiseDateEditor}
        />
      );
    }

    return (
      <OutcomeOptionList
        options={outcomeOptions}
        value={outcome}
        onChange={(value) => selectOutcome(value as ActivityInteractionResult)}
        prompt={outcomePrompt}
        afterOptions={afterOptions}
        note={{
          value: note,
          onChange: setNote,
          required: noteRequired,
          hint: noteHint,
          invalid: showNoteValidation,
        }}
        compact
      />
    );
  }

  return null;
}

import {
  ContactToneBadges,
  PromiseDateSummary,
  RecipientPicker,
} from "@/features/register-action/charge/components";
import type { useRegisterChargeActionFlow } from "@/features/register-action/charge/hooks/useRegisterChargeActionFlow";
import { OutcomeOptionList } from "@/features/register-action";
import {
  PhonePanel,
  VisitLocationPanel,
  WhatsAppPanel,
} from "@/features/register-action/preventive/components";
import { ActivityInteractionResult } from "@/services/activities/activity.enums";

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
    clientPhone,
    clientFirstName,
    waTemplates,
    selectedTemplate,
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
        clientPhone={clientPhone}
      />
    );
  }

  if (step === "contact" && contactType === "whatsapp") {
    return (
      <div className="flex flex-col gap-4">
        <ContactToneBadges
          queueTone={queueTone}
          templateTag={selectedTemplate?.tag}
        />
        <WhatsAppPanel
          phone={clientPhone}
          clientFirstName={clientFirstName}
          templates={waTemplates}
        />
      </div>
    );
  }

  if (step === "contact" && contactType === "phone") {
    return (
      <PhonePanel
        phone={clientPhone}
        clientFirstName={clientFirstName}
        templates={waTemplates}
      />
    );
  }

  if (step === "contact" && contactType === "visit") {
    return (
      <VisitLocationPanel
        address={client.address}
        status={location.status}
        locationCheckResult={location.result}
        onVerifyLocation={location.verify}
        onConfirmManual={location.confirmManual}
      />
    );
  }

  if (step === "outcome") {
    return (
      <OutcomeOptionList
        options={outcomeOptions}
        value={outcome}
        onChange={(value) => selectOutcome(value as ActivityInteractionResult)}
        prompt={
          isVisitTask
            ? "Qual foi o resultado da visita?"
            : "Qual foi o resultado do contato?"
        }
        afterOptions={
          outcome === ActivityInteractionResult.PAYMENT_PROMISE &&
          promiseDate ? (
            <PromiseDateSummary
              date={promiseDate}
              onChange={openPromiseDateEditor}
            />
          ) : undefined
        }
        note={{
          value: note,
          onChange: setNote,
          required: noteRequired,
          hint: showNoteValidation
            ? "Descreva o motivo nas observações para poder registrar."
            : undefined,
          invalid: showNoteValidation,
        }}
        compact
      />
    );
  }

  return null;
}

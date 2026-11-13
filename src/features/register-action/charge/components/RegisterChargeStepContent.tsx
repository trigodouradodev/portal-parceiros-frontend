import { requiresOverdueReason } from "@/lib/overdue-reasons";
import { OutcomeOptionList } from "@/features/register-action";
import type { useRegisterChargeActionFlow } from "@/features/register-action/charge/hooks/useRegisterChargeActionFlow";
import { WhatsAppPanel } from "@/features/register-action/preventive/components";
import type { ActivityInteractionResult } from "@/services/activities/activity.enums";
import { OverdueReasonField } from "@/features/register-action/components/OverdueReasonField";
import { ChargePhoneStep } from "./ChargePhoneStep";
import { ChargeVisitStep } from "./ChargeVisitStep";
import { ContactToneBadges } from "./ContactToneBadges";
import { OutcomeDateSummary } from "./OutcomeDateSummary";
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
    overdueReason,
    setOverdueReason,
    note,
    setNote,
    outcomeDate,
    dateKind,
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
    openOutcomeDateEditor,
  } = flow;

  if (!client) return null;

  if (step === "recipient") {
    return (
      <RecipientPicker
        value={recipientType}
        onChange={setRecipientType}
        clientName={client.name}
        clientIsDeceased={client.isDeceased}
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
        geoFailureReason={location.geoFailureReason}
        geoPermissionState={location.geoPermissionState}
        onVerifyLocation={location.verify}
        onConfirmManual={location.confirmManual}
      />
    );
  }

  if (step === "outcome") {
    let noteHint: string | undefined;
    if (showNoteValidation) {
      noteHint = "Descreva o motivo nas observações para poder registrar.";
    }

    const afterOptions = (
      <>
        {dateKind && outcomeDate && (
          <OutcomeDateSummary
            kind={dateKind}
            date={outcomeDate}
            onChange={openOutcomeDateEditor}
          />
        )}
        {requiresOverdueReason(outcome) && (
          <OverdueReasonField
            value={overdueReason}
            onChange={setOverdueReason}
          />
        )}
      </>
    );

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
          placeholder: isVisitTask
            ? "Descreva detalhes da visita..."
            : "Descreva detalhes do contato...",
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

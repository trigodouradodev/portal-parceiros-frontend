import { CalendarDays, ChevronRight, MapPinOff } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { useRegisterChargeActionFlow } from "@/features/register-action/charge/hooks/useRegisterChargeActionFlow";
import {
  RegisterActionFooter,
  RegisterSaveButton,
} from "@/features/register-action";

type Flow = ReturnType<typeof useRegisterChargeActionFlow>;

interface RegisterChargeFooterActionsProps {
  flow: Flow;
}

function getContactContinueContent(needsLocationConfirm: boolean): ReactNode {
  if (needsLocationConfirm) {
    return (
      <>
        <MapPinOff size={15} />
        Confirme a localização
      </>
    );
  }

  return (
    <>
      Registrar resultado <ChevronRight size={16} />
    </>
  );
}

function getSaveButtonLabel(needsPromiseDate: boolean): string {
  if (needsPromiseDate) return "Informe a data prometida";
  return "Registrar";
}

function getSaveButtonIcon(needsPromiseDate: boolean): ReactNode | undefined {
  if (!needsPromiseDate) return undefined;
  return <CalendarDays size={15} />;
}

export function RegisterChargeFooterActions({
  flow,
}: RegisterChargeFooterActionsProps) {
  const {
    step,
    setStep,
    isVisitTask,
    location,
    canContinueRecipient,
    canContinueContact,
    canSaveOutcome,
    needsPromiseDate,
    saving,
    handleSave,
    goToContactStep,
    goBackToRecipientStep,
  } = flow;

  const needsLocationConfirm = isVisitTask && !location.locationOk;
  const saveButtonIcon = getSaveButtonIcon(needsPromiseDate);

  return (
    <RegisterActionFooter>
      {step === "recipient" && (
        <Button
          className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
          disabled={!canContinueRecipient}
          onClick={goToContactStep}
        >
          Continuar <ChevronRight size={16} />
        </Button>
      )}

      {step === "contact" && (
        <>
          <Button
            variant="outline"
            className="h-12 rounded-2xl px-5"
            onClick={goBackToRecipientStep}
          >
            Voltar
          </Button>
          <Button
            className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
            disabled={!canContinueContact}
            onClick={() => setStep("outcome")}
          >
            {getContactContinueContent(needsLocationConfirm)}
          </Button>
        </>
      )}

      {step === "outcome" && (
        <>
          <Button
            variant="outline"
            className="h-12 rounded-2xl px-5"
            onClick={() => setStep("contact")}
          >
            Voltar
          </Button>
          <RegisterSaveButton
            saving={saving}
            disabled={!canSaveOutcome}
            onClick={handleSave}
            label={getSaveButtonLabel(needsPromiseDate)}
            icon={saveButtonIcon}
          />
        </>
      )}
    </RegisterActionFooter>
  );
}

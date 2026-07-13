import { CalendarDays, ChevronRight, MapPinOff } from "lucide-react";
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
  } = flow;

  return (
    <RegisterActionFooter>
      {step === "recipient" && (
        <Button
          className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
          disabled={!canContinueRecipient}
          onClick={() => setStep("contact")}
        >
          Continuar <ChevronRight size={16} />
        </Button>
      )}

      {step === "contact" && (
        <>
          <Button
            variant="outline"
            className="h-12 rounded-2xl px-5"
            onClick={() => setStep("recipient")}
          >
            Voltar
          </Button>
          <Button
            className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
            disabled={!canContinueContact}
            onClick={() => setStep("outcome")}
          >
            {isVisitTask && !location.locationOk ? (
              <>
                <MapPinOff size={15} />
                Confirme a localização
              </>
            ) : (
              <>
                Registrar resultado <ChevronRight size={16} />
              </>
            )}
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
            label={needsPromiseDate ? "Informe a data prometida" : "Registrar"}
            {...(needsPromiseDate ? { icon: <CalendarDays size={15} /> } : {})}
          />
        </>
      )}
    </RegisterActionFooter>
  );
}

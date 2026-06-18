import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Handshake,
  PhoneOff,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionContext } from "@/contexts/action";
import {
  COBR_TITLES,
  getCobrOutcomeOptions,
} from "@/features/register-action/constants/cobr-outcomes";
import {
  OutcomeOptionList,
  RegisterActionFooter,
  RegisterActionLayout,
  RegisterFormCard,
  RegisterSaveButton,
  RegisterStagePills,
  RegisterStepIndicator,
  useRegisterActionGuard,
} from "@/features/register-action";
import { buildCobrFollowUpPayload } from "@/features/register-action/utils/map-to-follow-up";
import { useCreateFollowUp } from "@/hooks/useCreateFollowUp";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";

type Step = "outcome" | "boleto";

export function RegisterCobrActionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createFollowUp = useCreateFollowUp();
  const { client, cobrStage, onComplete, clearActionData } = useActionContext();
  const [step, setStep] = useState<Step>(
    cobrStage === "promise" ? "boleto" : "outcome",
  );
  const [outcome, setOutcome] = useState<string | null>(null);
  const [boletoValue, setBoletoValue] = useState(client?.value ?? "");
  const [boletoDate, setBoletoDate] = useState("");
  const [note, setNote] = useState("");

  const ready = Boolean(client && cobrStage);

  useRegisterActionGuard({ ready });

  const handleBack = useCallback(() => {
    clearActionData();
    navigate(-1);
  }, [clearActionData, navigate]);

  if (!client || !cobrStage) {
    return null;
  }

  const title = COBR_TITLES[cobrStage] ?? "Registrar ação";
  const saving = createFollowUp.isPending;
  const outcomeOptions = getCobrOutcomeOptions(cobrStage, {
    no_return_1: <PhoneOff size={18} />,
    no_return_2: <PhoneOff size={18} />,
    sem_previsao: <Calendar size={18} />,
    promise: <Handshake size={18} />,
    paid: <CheckCircle2 size={18} />,
    not_paid: <XCircle size={18} />,
  });
  const canSaveOutcome = step === "outcome" && outcome !== null;
  const canSaveBoleto = step === "boleto" && boletoDate !== "";

  async function submitFollowUp(outcomeValue: string, boletoDueDate?: string) {
    const currentClient = client;
    if (!currentClient) return;

    try {
      const payload = buildCobrFollowUpPayload({
        contractId: currentClient.id,
        installmentNumber: currentClient.installmentNumber,
        outcome: outcomeValue,
        note,
        boletoDate: boletoDueDate,
      });
      await createFollowUp.mutateAsync(payload);
      onComplete({ note });
      clearActionData();
      navigate(-1);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erro ao registrar ação."), {
        variant: "destructive",
      });
    }
  }

  async function handleSave() {
    if (step === "outcome") {
      if (!outcome) return;
      if (outcome === "promise") {
        setStep("boleto");
        return;
      }
      await submitFollowUp(outcome);
      return;
    }

    if (step === "boleto") {
      if (!boletoDate) return;
      await submitFollowUp("promise", boletoDate);
    }
  }

  const stepIndicator =
    cobrStage !== "fup" && cobrStage !== "promise" ? (
      <RegisterStepIndicator
        steps={["Resultado", "Observações"]}
        currentStep={step === "outcome" ? 0 : 1}
      />
    ) : cobrStage === "fup" ? (
      <RegisterStagePills
        steps={["Ligação", "Promessa", "Boleto", "FUP"]}
        activeIndex={3}
      />
    ) : (
      <RegisterStagePills steps={["Promessa", "Boleto", "FUP"]} activeIndex={1} />
    );

  return (
    <RegisterActionLayout
      title={title}
      client={client}
      onBack={handleBack}
      beforeContent={stepIndicator}
      footer={
        <RegisterActionFooter>
          {step === "boleto" && (
            <Button
              variant="outline"
              className="h-12 rounded-2xl px-5"
              onClick={() => {
                setStep("outcome");
                setOutcome(null);
              }}
            >
              Voltar
            </Button>
          )}
          <RegisterSaveButton
            saving={saving}
            disabled={!canSaveOutcome && !canSaveBoleto}
            onClick={handleSave}
            variant={step === "boleto" ? "success" : "navy"}
            label={step === "boleto" ? "Emitir Boleto" : "Registrar"}
            icon={step === "boleto" ? <Send size={15} /> : undefined}
          />
        </RegisterActionFooter>
      }
    >
      <RegisterFormCard>
        {step === "outcome" && (
          <OutcomeOptionList
            options={outcomeOptions}
            value={outcome}
            onChange={setOutcome}
            prompt="Qual foi o resultado da ligação?"
            note={{ value: note, onChange: setNote }}
          />
        )}

        {step === "boleto" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2.5 rounded-2xl bg-brand-yellow/15 p-3.5">
              <Handshake
                size={16}
                className="mt-0.5 shrink-0 text-brand-navy"
              />
              <p className="text-xs font-medium text-brand-navy">
                Cliente fez promessa de pagamento. Emita o boleto e um FUP será
                agendado automaticamente.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label>Valor do boleto</Label>
                <Input
                  className="mt-1"
                  value={boletoValue}
                  onChange={(event) => setBoletoValue(event.target.value)}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex-1">
                <Label>Vencimento</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={boletoDate}
                  onChange={(event) => setBoletoDate(event.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>
                Observações{" "}
                <span className="font-normal text-muted-foreground/60">
                  (opcional)
                </span>
              </Label>
              <Textarea
                className="mt-1 min-h-[72px]"
                placeholder="Detalhes da promessa…"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>
        )}
      </RegisterFormCard>
    </RegisterActionLayout>
  );
}

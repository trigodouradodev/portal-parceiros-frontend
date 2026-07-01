import { useEffect, useState } from "react";
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
  CHARGE_TITLES,
  getOutcomeOptions,
} from "@/features/register-action/charge/constants/outcomes";
import {
  ChargeOutcome,
  type ChargeOutcome as ChargeOutcomeValue,
} from "@/features/register-action/charge/types";
import { ContactPanel } from "@/features/register-action/charge/components";
import { getWaTemplates } from "@/features/register-action/charge/utils/wa-templates";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";
import {
  OutcomeOptionList,
  RegisterActionFooter,
  RegisterActionLayout,
  RegisterFormCard,
  RegisterSaveButton,
  RegisterStagePills,
  RegisterStepIndicator,
} from "@/features/register-action";
import { VisitLocationPanel } from "@/features/register-action/preventive/components";
import { useVisitLocationCheck } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import { buildRegisterInteractionPayload } from "@/features/register-action/utils/map-to-interaction";
import { useRegisterInteraction } from "@/hooks/useRegisterInteraction";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getFirstName } from "@/lib/user-display";

type Step = "outcome" | "boleto";

export function RegisterChargeActionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const registerInteraction = useRegisterInteraction();
  const { client, chargeStage, taskId, taskChannel, onComplete } =
    useActionContext();
  const [step, setStep] = useState<Step>(
    chargeStage === "promise" ? "boleto" : "outcome",
  );
  const [outcome, setOutcome] = useState<ChargeOutcomeValue | null>(null);
  const [boletoValue, setBoletoValue] = useState(client?.value ?? "");
  const [boletoDate, setBoletoDate] = useState("");
  const [note, setNote] = useState("");

  const {
    status: locationStatus,
    result: locationCheckResult,
    coords: geoCoords,
    verify: verifyLocationCheck,
    confirmManual,
    locationOk,
  } = useVisitLocationCheck({
    contractId: client?.id ?? "",
    installmentNumber: client?.installmentNumber ?? 0,
  });

  useEffect(() => {
    if (!taskId) {
      showToast("Nenhuma tarefa de cobrança pendente para registrar.", {
        variant: "destructive",
      });
      navigate(-1);
    }
  }, [taskId, navigate, showToast]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!client || !chargeStage || !taskId) {
    return null;
  }

  const isVisitTask = taskChannel === ActivityChannel.CLIENT_VISIT;
  const title = CHARGE_TITLES[chargeStage] ?? "Registrar ação";
  const clientPhone = client.phone ?? "";
  const clientFirstName = getFirstName(client.name);
  const waTemplates = getWaTemplates(client);
  const saving = registerInteraction.isPending;
  const outcomeOptions = getOutcomeOptions(chargeStage, {
    [ChargeOutcome.NO_RETURN]: <PhoneOff size={18} />,
    [ChargeOutcome.SEM_PREVISAO]: <Calendar size={18} />,
    [ChargeOutcome.PROMISE]: <Handshake size={18} />,
    [ChargeOutcome.PAID]: <CheckCircle2 size={18} />,
    [ChargeOutcome.NOT_PAID]: <XCircle size={18} />,
  });
  const visitLocationReady = !isVisitTask || locationOk;
  const canSaveOutcome =
    step === "outcome" && outcome !== null && visitLocationReady;
  const canSaveBoleto = step === "boleto" && boletoDate !== "";

  async function submitInteraction(
    outcomeValue: ChargeOutcomeValue,
    boletoDueDate?: string,
  ) {
    const currentClient = client;
    if (!currentClient || !taskId) return;

    const includeGeo = isVisitTask && locationOk && geoCoords !== null;

    try {
      const payload = buildRegisterInteractionPayload({
        outcome: outcomeValue,
        note,
        promiseDate: boletoDueDate,
        taskChannel,
        latitude: includeGeo ? geoCoords.latitude : undefined,
        longitude: includeGeo ? geoCoords.longitude : undefined,
      });
      await registerInteraction.mutateAsync({
        taskId,
        payload,
        contractId: currentClient.id,
        installmentNumber: currentClient.installmentNumber,
      });
      onComplete({ note });
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
      if (isVisitTask && !locationOk) {
        showToast("Confirme a localização da visita antes de registrar.", {
          variant: "destructive",
        });
        return;
      }
      if (outcome === ChargeOutcome.PROMISE) {
        setStep("boleto");
        return;
      }
      await submitInteraction(outcome);
      return;
    }

    if (step === "boleto") {
      if (!boletoDate) return;
      await submitInteraction(ChargeOutcome.PROMISE, boletoDate);
    }
  }

  const stepIndicator =
    chargeStage !== "fup" && chargeStage !== "promise" ? (
      <RegisterStepIndicator
        steps={["Resultado", "Observações"]}
        currentStep={step === "outcome" ? 0 : 1}
      />
    ) : chargeStage === "fup" ? (
      <RegisterStagePills
        steps={["Ligação", "Promessa", "Boleto", "FUP"]}
        activeIndex={3}
      />
    ) : (
      <RegisterStagePills
        steps={["Promessa", "Boleto", "FUP"]}
        activeIndex={1}
      />
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
          <>
            {isVisitTask ? (
              <VisitLocationPanel
                address={client.address}
                status={locationStatus}
                locationCheckResult={locationCheckResult}
                onVerifyLocation={verifyLocationCheck}
                onConfirmManual={confirmManual}
              />
            ) : (
              <ContactPanel
                phone={clientPhone}
                clientFirstName={clientFirstName}
                templates={waTemplates}
              />
            )}
            <OutcomeOptionList
              options={outcomeOptions}
              value={outcome}
              onChange={(value) => setOutcome(value as ChargeOutcomeValue)}
              prompt={
                isVisitTask
                  ? "Qual foi o resultado da visita?"
                  : taskChannel === ActivityChannel.WHATSAPP_MESSAGE
                    ? "Qual foi o resultado do contato?"
                    : "Qual foi o resultado da ligação?"
              }
              note={{ value: note, onChange: setNote }}
            />
          </>
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

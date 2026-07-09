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
import {
  getPromiseDateBounds,
  validatePromiseDate,
} from "@/features/register-action/charge/utils/validate-promise-date";
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

type Step = "outcome" | "promiseDetails";

export function RegisterChargeActionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const registerInteraction = useRegisterInteraction();
  const { client, chargeStage, taskId, taskChannel, onComplete } =
    useActionContext();
  const [step, setStep] = useState<Step>(
    chargeStage === "promise" ? "promiseDetails" : "outcome",
  );
  const [outcome, setOutcome] = useState<ChargeOutcomeValue | null>(null);
  const [promiseDate, setPromiseDate] = useState("");
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
  const promiseDateBounds = getPromiseDateBounds();
  const promiseDateError = promiseDate
    ? validatePromiseDate(promiseDate)
    : null;
  const canSaveOutcome =
    step === "outcome" && outcome !== null && visitLocationReady;
  const canSavePromise =
    step === "promiseDetails" &&
    promiseDate !== "" &&
    promiseDateError === null;

  async function submitInteraction(
    outcomeValue: ChargeOutcomeValue,
    selectedPromiseDate?: string,
  ) {
    const currentClient = client;
    if (!currentClient || !taskId) return;

    const includeGeo = isVisitTask && locationOk && geoCoords !== null;

    try {
      const payload = buildRegisterInteractionPayload({
        outcome: outcomeValue,
        note,
        promiseDate: selectedPromiseDate,
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
        setStep("promiseDetails");
        return;
      }
      await submitInteraction(outcome);
      return;
    }

    if (step === "promiseDetails") {
      if (!promiseDate) return;
      const dateError = validatePromiseDate(promiseDate);
      if (dateError) {
        showToast(dateError, { variant: "destructive" });
        return;
      }
      await submitInteraction(ChargeOutcome.PROMISE, promiseDate);
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
        steps={["Promessa", "FUP"]}
        activeIndex={0}
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
          {step === "promiseDetails" && chargeStage !== "promise" && (
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
            disabled={!canSaveOutcome && !canSavePromise}
            onClick={handleSave}
            variant={step === "promiseDetails" ? "success" : "navy"}
            label={step === "promiseDetails" ? "Registrar promessa" : "Registrar"}
            icon={step === "promiseDetails" ? <Send size={15} /> : undefined}
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

        {step === "promiseDetails" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2.5 rounded-2xl bg-brand-yellow/15 p-3.5">
              <Handshake
                size={16}
                className="mt-0.5 shrink-0 text-brand-navy"
              />
              <p className="text-xs font-medium text-brand-navy">
                Cliente fez promessa de pagamento. Informe a data prevista de
                pagamento (máximo de 10 dias) para registrar a promessa.
              </p>
            </div>
            <div>
              <Label>Previsão de pagamento</Label>
              <Input
                className="mt-1"
                type="date"
                min={promiseDateBounds.min}
                max={promiseDateBounds.max}
                value={promiseDate}
                onChange={(event) => setPromiseDate(event.target.value)}
              />
              {promiseDateError && (
                <p className="mt-1 text-xs text-destructive">
                  {promiseDateError}
                </p>
              )}
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

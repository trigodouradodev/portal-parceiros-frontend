import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, MapPinOff } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useActionContext } from "@/contexts/action";
import type { PreventiveContactType } from "@/contexts/action/action-context";
import {
  getV2InteractionOutcomeOptions,
  requiresInteractionObservation,
} from "@/features/register-action/charge/constants/v2-interaction-outcomes";
import {
  ContactToneBadges,
  PromiseDateModal,
  PromiseDateSummary,
  RecipientPicker,
} from "@/features/register-action/charge/components";
import { getWaTemplates } from "@/features/register-action/charge/utils/wa-templates";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";
import {
  ActivityInteractionResult,
  ActivityRecipientType,
  PROMISE_MAX_DAYS,
} from "@/services/activities/activity.enums";
import {
  OutcomeOptionList,
  RegisterActionFooter,
  RegisterActionLayout,
  RegisterFormCard,
  RegisterSaveButton,
  RegisterStepIndicator,
} from "@/features/register-action";
import {
  PhonePanel,
  VisitLocationPanel,
  WhatsAppPanel,
} from "@/features/register-action/preventive/components";
import { useVisitLocationCheck } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import {
  buildV2RegisterInteractionPayload,
  mapTaskChannelToActivityTaskType,
} from "@/features/register-action/utils/map-to-interaction";
import { useRegisterInteraction } from "@/hooks/useRegisterInteraction";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getFirstName } from "@/lib/user-display";

type FlowStep = "recipient" | "contact" | "outcome";

const FLOW_STEPS = ["Destinatário", "Contato", "Resultado"] as const;

const STEP_TITLES: Record<FlowStep, string> = {
  recipient: "Destinatário",
  contact: "Contato",
  outcome: "Resultado do contato",
};

function resolveContactType(
  contactType: PreventiveContactType | undefined,
  taskChannel?: ActivityChannel,
): PreventiveContactType {
  if (contactType) return contactType;
  if (taskChannel === ActivityChannel.CLIENT_VISIT) return "visit";
  if (taskChannel === ActivityChannel.WHATSAPP_MESSAGE) return "whatsapp";
  return "phone";
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function RegisterChargeActionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const registerInteraction = useRegisterInteraction();
  const {
    client,
    taskId,
    taskChannel,
    installmentId,
    contactType: presetContactType,
    queueTone,
    onComplete,
  } = useActionContext();

  const [step, setStep] = useState<FlowStep>("recipient");
  const [recipientType, setRecipientType] = useState<ActivityRecipientType>(
    ActivityRecipientType.CLIENT,
  );
  const [outcome, setOutcome] = useState<ActivityInteractionResult | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [promiseDate, setPromiseDate] = useState<Date | undefined>(undefined);
  const [promiseModalOpen, setPromiseModalOpen] = useState(false);
  const [draftPromiseDate, setDraftPromiseDate] = useState<Date | undefined>(
    undefined,
  );

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

  const contactType = resolveContactType(presetContactType, taskChannel);
  const isVisitTask = contactType === "visit";
  const activityTaskType = mapTaskChannelToActivityTaskType(
    taskChannel,
    contactType,
  );

  const outcomeOptions = useMemo(
    () => getV2InteractionOutcomeOptions(activityTaskType),
    [activityTaskType],
  );

  const handleBack = () => {
    navigate(-1);
  };

  if (!client || !taskId) {
    return null;
  }

  const clientPhone = client.phone ?? "";
  const clientFirstName = getFirstName(client.name);
  const waTemplates = getWaTemplates(client);
  const selectedTemplate = waTemplates[0];
  const saving = registerInteraction.isPending;

  const currentStepIndex =
    step === "recipient" ? 0 : step === "contact" ? 1 : 2;

  const visitLocationReady = !isVisitTask || locationOk;
  const noteRequired =
    outcome !== null && requiresInteractionObservation(outcome);
  const showNoteValidation = noteRequired && !note.trim();
  const needsPromiseDate =
    outcome === ActivityInteractionResult.PAYMENT_PROMISE && !promiseDate;
  const canContinueRecipient = recipientType === ActivityRecipientType.CLIENT;
  const canContinueContact = visitLocationReady;
  const canSaveOutcome =
    step === "outcome" &&
    outcome !== null &&
    !needsPromiseDate &&
    (!noteRequired || note.trim().length > 0);

  const promiseDateMin = startOfDay(new Date());
  const promiseDateMax = addDays(promiseDateMin, PROMISE_MAX_DAYS);

  function selectOutcome(value: ActivityInteractionResult) {
    setOutcome(value);
    if (value === ActivityInteractionResult.PAYMENT_PROMISE) {
      setDraftPromiseDate(promiseDate);
      setPromiseModalOpen(true);
      return;
    }
    setPromiseDate(undefined);
  }

  function handlePromiseModalOpenChange(open: boolean) {
    if (!open && !promiseDate) {
      setOutcome((current) =>
        current === ActivityInteractionResult.PAYMENT_PROMISE ? null : current,
      );
    }
    setPromiseModalOpen(open);
  }

  function confirmPromiseDate() {
    setPromiseDate(draftPromiseDate);
    setPromiseModalOpen(false);
  }

  async function submitInteraction(
    result: ActivityInteractionResult,
    promiseDateValue?: string,
  ) {
    if (!client || !taskId) return;

    const includeGeo = isVisitTask && locationOk && geoCoords !== null;

    try {
      const payload = buildV2RegisterInteractionPayload({
        result,
        recipientType,
        contactType,
        taskChannel,
        note,
        promiseDate: promiseDateValue,
        latitude: includeGeo ? geoCoords.latitude : undefined,
        longitude: includeGeo ? geoCoords.longitude : undefined,
      });
      await registerInteraction.mutateAsync({
        taskId,
        payload,
        contractId: client.id,
        installmentNumber: client.installmentNumber,
        installmentId,
      });
      onComplete({ note, outcome: result });
      navigate(-1);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erro ao registrar ação."), {
        variant: "destructive",
      });
    }
  }

  async function handleSave() {
    if (step !== "outcome" || !outcome) return;
    if (noteRequired && !note.trim()) return;
    if (needsPromiseDate) return;
    if (isVisitTask && !locationOk) {
      showToast("Confirme a localização da visita antes de registrar.", {
        variant: "destructive",
      });
      return;
    }

    const promiseDateValue =
      outcome === ActivityInteractionResult.PAYMENT_PROMISE && promiseDate
        ? format(promiseDate, "yyyy-MM-dd")
        : undefined;

    await submitInteraction(outcome, promiseDateValue);
  }

  return (
    <RegisterActionLayout
      title={STEP_TITLES[step]}
      client={client}
      onBack={handleBack}
      beforeContent={
        <RegisterStepIndicator
          steps={[...FLOW_STEPS]}
          currentStep={currentStepIndex}
          connectorClassName="mx-2 h-px w-6 bg-border"
        />
      }
      footer={
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
                {isVisitTask && !locationOk ? (
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
                label={
                  needsPromiseDate ? "Informe a data prometida" : "Registrar"
                }
                {...(needsPromiseDate
                  ? { icon: <CalendarDays size={15} /> }
                  : {})}
              />
            </>
          )}
        </RegisterActionFooter>
      }
    >
      <RegisterFormCard>
        {step === "recipient" && (
          <RecipientPicker
            value={recipientType}
            onChange={setRecipientType}
            clientName={client.name}
            clientPhone={clientPhone}
          />
        )}

        {step === "contact" && contactType === "whatsapp" && (
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
        )}

        {step === "contact" && contactType === "phone" && (
          <PhonePanel
            phone={clientPhone}
            clientFirstName={clientFirstName}
            templates={waTemplates}
          />
        )}

        {step === "contact" && contactType === "visit" && (
          <VisitLocationPanel
            address={client.address}
            status={locationStatus}
            locationCheckResult={locationCheckResult}
            onVerifyLocation={verifyLocationCheck}
            onConfirmManual={confirmManual}
          />
        )}

        {step === "outcome" && (
          <OutcomeOptionList
            options={outcomeOptions}
            value={outcome}
            onChange={(value) =>
              selectOutcome(value as ActivityInteractionResult)
            }
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
                  onChange={() => {
                    setDraftPromiseDate(promiseDate);
                    setPromiseModalOpen(true);
                  }}
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
        )}
      </RegisterFormCard>

      <PromiseDateModal
        open={promiseModalOpen}
        onOpenChange={handlePromiseModalOpenChange}
        draftDate={draftPromiseDate}
        onDraftDateChange={setDraftPromiseDate}
        onConfirm={confirmPromiseDate}
        minDate={promiseDateMin}
        maxDate={promiseDateMax}
      />
    </RegisterActionLayout>
  );
}

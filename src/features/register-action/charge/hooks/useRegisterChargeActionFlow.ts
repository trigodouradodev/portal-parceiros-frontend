import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useActionContext } from "@/contexts/action";
import type { PreventiveContactType } from "@/contexts/action/action-context";
import {
  getV2InteractionOutcomeOptions,
  requiresInteractionObservation,
} from "@/features/register-action/charge/constants/v2-interaction-outcomes";
import { getWaTemplates } from "@/features/register-action/charge/utils/wa-templates";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";
import {
  ActivityInteractionResult,
  ActivityRecipientType,
  PROMISE_MAX_DAYS,
} from "@/services/activities/activity.enums";
import {
  buildV2RegisterInteractionPayload,
  mapTaskChannelToActivityTaskType,
} from "@/features/register-action/utils/map-to-interaction";
import { useVisitLocationCheck } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import { useRegisterInteraction } from "@/hooks/useRegisterInteraction";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getFirstName } from "@/lib/user-display";
import { addDays, startOfDay } from "@/components/ui/calendar-utils";

export type FlowStep = "recipient" | "contact" | "outcome";

export const FLOW_STEPS = ["Destinatário", "Contato", "Resultado"] as const;

export const STEP_TITLES: Record<FlowStep, string> = {
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

export function useRegisterChargeActionFlow() {
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

  const location = useVisitLocationCheck({
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

  const clientPhone = client?.phone ?? "";
  const clientFirstName = client ? getFirstName(client.name) : "";
  const waTemplates = client ? getWaTemplates(client) : [];
  const selectedTemplate = waTemplates[0];
  const saving = registerInteraction.isPending;

  const currentStepIndex =
    step === "recipient" ? 0 : step === "contact" ? 1 : 2;

  const visitLocationReady = !isVisitTask || location.locationOk;
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

  function openPromiseDateEditor() {
    setDraftPromiseDate(promiseDate);
    setPromiseModalOpen(true);
  }

  async function submitInteraction(
    result: ActivityInteractionResult,
    promiseDateValue?: string,
  ) {
    if (!client || !taskId) return;

    const includeGeo =
      isVisitTask && location.locationOk && location.coords !== null;

    try {
      const payload = buildV2RegisterInteractionPayload({
        result,
        recipientType,
        contactType,
        taskChannel,
        note,
        promiseDate: promiseDateValue,
        latitude: includeGeo ? location.coords.latitude : undefined,
        longitude: includeGeo ? location.coords.longitude : undefined,
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
    if (isVisitTask && !location.locationOk) {
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

  return {
    client,
    taskId,
    step,
    setStep,
    currentStepIndex,
    contactType,
    isVisitTask,
    queueTone,
    recipientType,
    setRecipientType,
    outcome,
    note,
    setNote,
    promiseDate,
    promiseModalOpen,
    draftPromiseDate,
    setDraftPromiseDate,
    outcomeOptions,
    clientPhone,
    clientFirstName,
    waTemplates,
    selectedTemplate,
    saving,
    location,
    noteRequired,
    showNoteValidation,
    needsPromiseDate,
    canContinueRecipient,
    canContinueContact,
    canSaveOutcome,
    promiseDateMin,
    promiseDateMax,
    selectOutcome,
    handlePromiseModalOpenChange,
    confirmPromiseDate,
    openPromiseDateEditor,
    handleSave,
    handleBack: () => navigate(-1),
  };
}

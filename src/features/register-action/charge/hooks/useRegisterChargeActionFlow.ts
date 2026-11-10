import { useEffect, useMemo, useState } from "react";
import type { OverdueReason } from "@/lib/overdue-reasons";
import { requiresOverdueReason } from "@/lib/overdue-reasons";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useActionContext } from "@/contexts/action";
import type { PreventiveContactType } from "@/contexts/action/action-context";
import {
  getV2InteractionOutcomeOptions,
  requiresInteractionObservation,
} from "@/features/register-action/charge/constants/v2-interaction-outcomes";
import {
  getCallScript,
  getVisitScript,
} from "@/features/register-action/charge/constants/scripts";
import {
  getChargeFlowSteps,
  getChargeStepTitle,
  type FlowStep,
} from "@/features/register-action/charge/utils/flow-steps";
import {
  getRecipientAddressLabel,
  getRecipientPhoneLabel,
} from "@/features/register-action/charge/utils/recipient-labels";
import { getWaTemplates } from "@/features/register-action/charge/utils/wa-templates";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";
import {
  ActivityInteractionResult,
  ActivityRecipientType,
  PROMISE_MAX_DAYS,
} from "@/services/activities/activity.enums";
import { FollowUpParty } from "@/services/followup/followup.types";
import {
  buildV2RegisterInteractionPayload,
  mapTaskChannelToActivityTaskType,
} from "@/features/register-action/utils/map-to-interaction";
import { useVisitLocationCheck } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import { appendManualLocationAuditNote } from "@/features/register-action/preventive/constants/manual-location-reason";
import { useRegisterInteraction } from "@/hooks/useRegisterInteraction";
import { useToast } from "@/contexts/toast/toast-context";
import {
  getTaskActionErrorMessage,
  isStaleTaskError,
} from "@/lib/api/task-action-errors";
import { hasCallablePhone, hasValidAddress } from "@/lib/contact-actions";
import { getFirstName } from "@/lib/user-display";
import { addDays } from "date-fns";
import { collectionToday, getOutcomeDateKind } from "../utils/outcome-date";
import { buildCompletedHighlightNavigationState } from "@/features/dashboard/utils/queue-highlight-navigation";

export type { FlowStep };

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
    guarantor,
    taskId,
    taskChannel,
    installmentId,
    contactType: presetContactType,
    queueTone,
    onComplete,
  } = useActionContext();

  const [step, setStep] = useState<FlowStep>("recipient");
  const [selectedRecipient, setRecipientType] = useState<ActivityRecipientType>(
    ActivityRecipientType.CLIENT,
  );
  const [outcome, setOutcome] = useState<ActivityInteractionResult | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [overdueReason, setOverdueReason] = useState<OverdueReason>();
  const recipientType = client?.isDeceased
    ? ActivityRecipientType.GUARANTOR
    : selectedRecipient;
  const [outcomeDate, setOutcomeDate] = useState<Date | undefined>(undefined);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | undefined>(undefined);

  const location = useVisitLocationCheck({
    contractId: client?.id ?? "",
    installmentNumber: client?.installmentNumber ?? 0,
    party:
      recipientType === ActivityRecipientType.GUARANTOR
        ? FollowUpParty.GUARANTOR
        : FollowUpParty.CLIENT,
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
  const flowSteps = getChargeFlowSteps(contactType);
  const stepTitle = getChargeStepTitle(step, contactType);
  const visitScript = getVisitScript(queueTone, client?.contract);
  const addressLabel = getRecipientAddressLabel(recipientType);
  const phoneLabel = getRecipientPhoneLabel(recipientType);
  const activityTaskType = mapTaskChannelToActivityTaskType(
    taskChannel,
    contactType,
  );

  const outcomeOptions = useMemo(
    () => getV2InteractionOutcomeOptions(activityTaskType),
    [activityTaskType],
  );

  const activeParty =
    recipientType === ActivityRecipientType.GUARANTOR
      ? (guarantor ?? null)
      : client
        ? {
            name: client.name,
            phone: client.phone,
            address: client.address,
          }
        : null;

  const contactPhone = activeParty?.phone ?? "";
  const contactFirstName = activeParty ? getFirstName(activeParty.name) : "";
  const contactAddress =
    recipientType === ActivityRecipientType.GUARANTOR
      ? guarantor?.address
      : client?.address;
  const callScript = getCallScript(queueTone, {
    contract: client?.contract,
    contactFirstName,
  });

  const waTemplates = client
    ? getWaTemplates(
        {
          name: activeParty?.name ?? client.name,
          parcela: client.parcela,
          value: client.value,
          daysInfo: client.daysInfo,
        },
        queueTone,
      )
    : [];
  const selectedTemplate = waTemplates[0];
  const saving = registerInteraction.isPending;

  const currentStepIndex =
    step === "recipient" ? 0 : step === "contact" ? 1 : 2;

  const visitLocationReady = !isVisitTask || location.locationOk;
  const noteRequired =
    outcome !== null && requiresInteractionObservation(outcome);
  const showNoteValidation = noteRequired && note.trim().length === 0;
  const needsOverdueReason = requiresOverdueReason(outcome) && !overdueReason;
  const dateKind = getOutcomeDateKind(outcome);
  const today = collectionToday();
  const dateMin = dateKind === "agreement" ? addDays(today, 1) : today;
  const dateMax = addDays(today, PROMISE_MAX_DAYS);
  const needsOutcomeDate =
    Boolean(dateKind) &&
    (!outcomeDate || outcomeDate < dateMin || outcomeDate > dateMax);

  const guarantorSelectable = Boolean(
    guarantor?.name &&
    !guarantor.isDeceased &&
    (isVisitTask
      ? hasValidAddress(guarantor.address)
      : hasCallablePhone(guarantor.phone) ||
        hasValidAddress(guarantor.address)),
  );

  const canContinueRecipient =
    (recipientType === ActivityRecipientType.CLIENT && !client?.isDeceased) ||
    (recipientType === ActivityRecipientType.GUARANTOR && guarantorSelectable);
  const canContinueContact = visitLocationReady;
  const canSaveOutcome =
    step === "outcome" &&
    outcome !== null &&
    canContinueRecipient &&
    !needsOutcomeDate &&
    !needsOverdueReason &&
    (!noteRequired || note.trim().length > 0);

  function selectOutcome(value: ActivityInteractionResult) {
    if (value !== outcome) setOverdueReason(undefined);
    const kind = getOutcomeDateKind(value);
    const sameKind = kind === dateKind;
    setOutcome(value);
    if (kind) {
      setDraftDate(sameKind ? outcomeDate : undefined);
      if (!sameKind) setOutcomeDate(undefined);
      setDateModalOpen(true);
      return;
    }
    setOutcomeDate(undefined);
    setDraftDate(undefined);
    setDateModalOpen(false);
  }

  function handleDateModalOpenChange(open: boolean) {
    if (!open && !outcomeDate) {
      setOutcome((current) => (getOutcomeDateKind(current) ? null : current));
    }
    setDateModalOpen(open);
  }

  function confirmOutcomeDate() {
    if (!draftDate || draftDate < dateMin || draftDate > dateMax) return;
    setOutcomeDate(draftDate);
    setDateModalOpen(false);
  }

  function openOutcomeDateEditor() {
    setDraftDate(outcomeDate);
    setDateModalOpen(true);
  }

  async function submitInteraction(
    result: ActivityInteractionResult,
    selectedDate?: string,
  ) {
    if (!client || !taskId) return;

    const coords = location.coords;
    const includeGeo = isVisitTask && location.locationOk && coords !== null;
    const noteWithAudit =
      isVisitTask && location.status === "manual"
        ? appendManualLocationAuditNote(
            note,
            location.manualReason,
            Boolean(location.result?.addressLikelyWrong),
            location.manualNote,
          )
        : note;

    try {
      const payload = buildV2RegisterInteractionPayload({
        result,
        overdueReason,
        recipientType,
        contactType,
        taskChannel,
        note: noteWithAudit,
        promiseDate:
          result === ActivityInteractionResult.PAYMENT_PROMISE
            ? selectedDate
            : undefined,
        expectedAgreementDate:
          result === ActivityInteractionResult.RENEGOTIATION
            ? selectedDate
            : undefined,
        latitude: includeGeo ? coords.latitude : undefined,
        longitude: includeGeo ? coords.longitude : undefined,
        locationConfirmation:
          location.status === "confirmed"
            ? (location.result?.confirmationLevel ?? "exact")
            : location.status === "manual"
              ? "manual"
              : undefined,
        manualLocationReason:
          location.status === "manual"
            ? (location.manualReason ?? undefined)
            : undefined,
      });
      const response = await registerInteraction.mutateAsync({
        taskId,
        payload,
        contractId: client.id,
        installmentNumber: client.installmentNumber,
        installmentId,
      });
      onComplete({
        note: noteWithAudit,
        outcome: result,
        message: response.message,
      });
      navigate("/", {
        replace: true,
        state: buildCompletedHighlightNavigationState(installmentId),
      });
    } catch (err) {
      showToast(getTaskActionErrorMessage(err, "Erro ao registrar ação."), {
        variant: "destructive",
      });
      if (isStaleTaskError(err)) navigate("/", { replace: true });
    }
  }

  async function handleSave() {
    if (step !== "outcome" || !outcome) return;
    if (noteRequired && !note.trim()) return;
    if (needsOutcomeDate || needsOverdueReason || !canContinueRecipient) return;
    if (isVisitTask && !location.locationOk) {
      showToast("Confirme a localização da visita antes de registrar.", {
        variant: "destructive",
      });
      return;
    }

    const selectedDate =
      dateKind && outcomeDate ? format(outcomeDate, "yyyy-MM-dd") : undefined;
    await submitInteraction(outcome, selectedDate);
  }

  function goToContactStep() {
    if (isVisitTask) {
      location.reset();
    }
    setStep("contact");
  }

  function goBackToRecipientStep() {
    if (isVisitTask) {
      location.reset();
    }
    setStep("recipient");
  }

  let outcomePrompt = "Qual foi o resultado do contato?";
  if (isVisitTask) {
    outcomePrompt = "Qual foi o resultado da visita?";
  }

  return {
    client,
    guarantor,
    taskId,
    step,
    setStep,
    currentStepIndex,
    flowSteps,
    stepTitle,
    contactType,
    isVisitTask,
    visitScript,
    callScript,
    addressLabel,
    phoneLabel,
    queueTone,
    recipientType,
    setRecipientType,
    outcome,
    overdueReason,
    setOverdueReason,
    note,
    setNote,
    outcomeDate,
    dateModalOpen,
    draftDate,
    setDraftDate,
    dateKind,
    outcomeOptions,
    contactPhone,
    contactFirstName,
    contactAddress,
    outcomePrompt,
    waTemplates,
    selectedTemplate,
    saving,
    location,
    noteRequired,
    showNoteValidation,
    needsOutcomeDate,
    canContinueRecipient,
    canContinueContact,
    canSaveOutcome,
    dateMin,
    dateMax,
    selectOutcome,
    handleDateModalOpenChange,
    confirmOutcomeDate,
    openOutcomeDateEditor,
    handleSave,
    goToContactStep,
    goBackToRecipientStep,
    handleBack: () => navigate(-1),
  };
}

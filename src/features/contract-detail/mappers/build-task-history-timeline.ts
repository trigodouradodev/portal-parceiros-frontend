import type {
  TimelineStep,
  TimelineTone,
} from "@/features/contract-detail/types";
import { formatDate, formatDateTime } from "@/lib/format/date";
import {
  getActivityInteractionChannelLabel,
  getActivityInteractionResultLabel,
} from "@/services/activities/activity-interaction-labels";
import {
  ActivityTaskStatus,
  ActivityTaskType,
  type QueueTone,
} from "@/services/activities/activity.enums";
import type { TaskHistoryItem } from "@/services/activities/installment-detail.types";

/** Faixas de dia alinhadas ao protótipo (tom da régua, não nome do segmento). */
const TONE_DAY_RANGE: Record<QueueTone, string> = {
  friendly: "D+1–5",
  firm: "D+6–10",
  severe: "D+11+",
};

function mapTone(
  tone: QueueTone | string | undefined,
): TimelineTone | undefined {
  if (tone === "friendly" || tone === "firm" || tone === "severe") {
    return tone;
  }
  return undefined;
}

function getToneDayRange(tone: QueueTone | string | undefined): string {
  const mapped = mapTone(tone);
  return mapped ? TONE_DAY_RANGE[mapped] : TONE_DAY_RANGE.friendly;
}

function mapTaskStatus(status: ActivityTaskStatus): TimelineStep["status"] {
  if (status === ActivityTaskStatus.PENDING) return "current";
  if (
    status === ActivityTaskStatus.SYSTEM_CLOSED ||
    status === ActivityTaskStatus.CANCELLED
  ) {
    return "missed";
  }
  return "done";
}

function getCompletedContactLabel(channel: string): string {
  const base = getActivityInteractionChannelLabel(channel);
  if (base === "WhatsApp") return "WhatsApp enviado";
  if (base === "Ligação") return "Ligação realizada";
  return base;
}

function getTaskLabel(
  task: TaskHistoryItem,
  status: TimelineStep["status"],
): string {
  if (task.taskType === ActivityTaskType.VISIT) {
    return "Visita ao cliente";
  }

  if (status === "current" || status === "pending") {
    return "Contato";
  }

  if (task.interaction?.channel) {
    return getCompletedContactLabel(task.interaction.channel);
  }

  return "Contato";
}

function mapTaskToStep(task: TaskHistoryItem): TimelineStep {
  const interaction = task.interaction;
  const status = mapTaskStatus(task.status);
  const tone = mapTone(task.tone);

  const dateSource =
    interaction?.createdAt ??
    task.completedAt ??
    task.systemClosedAt ??
    task.cancelledAt ??
    task.createdAt;

  let note: string | undefined;
  if (status === "missed") {
    note =
      task.cancellationReason ||
      (task.status === ActivityTaskStatus.SYSTEM_CLOSED
        ? "Janela encerrada sem registro."
        : "Tarefa cancelada.");
  } else if (interaction?.observation) {
    note = interaction.observation;
  }

  return {
    id: `task-${task.id}`,
    day: getToneDayRange(task.tone),
    label: getTaskLabel(task, status),
    status,
    date: dateSource ? formatDateTime(dateSource) : undefined,
    agent: interaction?.author.name,
    note,
    tone,
    outcome: interaction?.result
      ? getActivityInteractionResultLabel(interaction.result)
      : undefined,
  };
}

function buildBoletoStep(dueDate: string | undefined): TimelineStep {
  return {
    id: "boleto-vencido",
    day: "Venc",
    label: "Boleto venceu",
    status: "done",
    date: dueDate ? formatDate(dueDate) : undefined,
  };
}

function buildVisitPlaceholder(status: "current" | "pending"): TimelineStep {
  return {
    id: "visit-upcoming",
    day: TONE_DAY_RANGE.severe,
    label: "Visita ao cliente",
    status,
    tone: "severe",
  };
}

function buildContactCurrentStep(): TimelineStep {
  return {
    id: "contact-current",
    day: TONE_DAY_RANGE.friendly,
    label: "Contato",
    status: "current",
    tone: "friendly",
  };
}

/**
 * Timeline de cobrança reconciliada (3 etapas):
 * Boleto venceu → Contato (1+ tentativas) → Visita.
 * Sempre inclui o marco inicial e a Visita futura quando ainda não existe tarefa de visita.
 */
export function buildTaskHistoryTimeline(
  tasks: TaskHistoryItem[],
  dueDate?: string,
): TimelineStep[] {
  const chronological = [...tasks].reverse();
  const steps: TimelineStep[] = [buildBoletoStep(dueDate)];

  if (chronological.length === 0) {
    steps.push(buildContactCurrentStep());
    steps.push(buildVisitPlaceholder("pending"));
    return steps;
  }

  steps.push(...chronological.map(mapTaskToStep));

  const hasVisitTask = chronological.some(
    (task) => task.taskType === ActivityTaskType.VISIT,
  );

  if (!hasVisitTask) {
    const hasCurrentContact = chronological.some(
      (task) =>
        task.taskType === ActivityTaskType.CONTACT &&
        task.status === ActivityTaskStatus.PENDING,
    );
    steps.push(
      buildVisitPlaceholder(hasCurrentContact ? "pending" : "current"),
    );
  }

  return steps;
}

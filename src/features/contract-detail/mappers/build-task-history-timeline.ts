import type {
  TimelineStep,
  TimelineTone,
} from "@/features/contract-detail/types";
import { formatDateTime } from "@/lib/format/date";
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

function mapTone(
  tone: QueueTone | string | undefined,
): TimelineTone | undefined {
  if (tone === "friendly" || tone === "firm" || tone === "severe") {
    return tone;
  }
  return undefined;
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

function getTaskChannelLabel(task: TaskHistoryItem): string {
  if (task.interaction?.channel) {
    return getActivityInteractionChannelLabel(task.interaction.channel);
  }
  return task.taskType === ActivityTaskType.VISIT ? "Visita" : "Contato";
}

function mapTaskToStep(task: TaskHistoryItem, index: number): TimelineStep {
  const interaction = task.interaction;
  const status = mapTaskStatus(task.status);
  const channelLabel = getTaskChannelLabel(task);
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
    day: task.segmentBadgeLabel ?? `#${index + 1}`,
    label: channelLabel,
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

/** Histórico de tarefas da parcela (API: mais recente primeiro). */
export function buildTaskHistoryTimeline(
  tasks: TaskHistoryItem[],
): TimelineStep[] {
  const chronological = [...tasks].reverse();
  const steps = chronological.map((task, index) => mapTaskToStep(task, index));

  const hasCurrent = steps.some((step) => step.status === "current");
  if (hasCurrent) {
    return steps;
  }

  const latestTone = chronological.at(-1)?.tone;

  return [
    ...steps,
    {
      id: "next-action",
      day: "Atual",
      label: "Registrar próxima ação",
      status: "current",
      tone: mapTone(latestTone) ?? "firm",
      note:
        steps.length === 0
          ? "Nenhuma interação registrada para esta parcela."
          : undefined,
    },
  ];
}

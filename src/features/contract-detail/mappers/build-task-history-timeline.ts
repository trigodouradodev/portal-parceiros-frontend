import type { TimelineStep } from "@/features/contract-detail/types";
import { formatDateTime } from "@/lib/format/date";
import {
  getActivityInteractionChannelLabel,
  getActivityInteractionResultLabel,
} from "@/services/activities/activity-interaction-labels";
import {
  ActivityTaskStatus,
  ActivityTaskType,
} from "@/services/activities/activity.enums";
import type { TaskHistoryItem } from "@/services/activities/installment-detail.types";

const TASK_STATUS_LABELS: Record<ActivityTaskStatus, string> = {
  [ActivityTaskStatus.PENDING]: "Pendente",
  [ActivityTaskStatus.COMPLETED]: "Concluída",
  [ActivityTaskStatus.SYSTEM_CLOSED]: "Encerrada pelo sistema",
  [ActivityTaskStatus.CANCELLED]: "Cancelada",
};

function mapTaskStatusLabel(status: ActivityTaskStatus): string {
  return TASK_STATUS_LABELS[status] ?? status;
}

function mapTaskToStep(task: TaskHistoryItem, index: number): TimelineStep {
  const interaction = task.interaction;
  const isPending = task.status === ActivityTaskStatus.PENDING;
  const label =
    interaction?.result != null
      ? getActivityInteractionResultLabel(interaction.result)
      : (task.segmentBadgeLabel ?? task.segmentCode);

  const noteParts: string[] = [];
  if (interaction) {
    noteParts.push(getActivityInteractionChannelLabel(interaction.channel));
    if (interaction.observation) {
      noteParts.push(interaction.observation);
    }
  } else if (task.status === ActivityTaskStatus.SYSTEM_CLOSED) {
    noteParts.push("Encerrada pelo sistema");
  } else {
    const channelLabel =
      task.taskType === ActivityTaskType.VISIT ? "Visita" : "Contato";
    noteParts.push(`${channelLabel} · ${mapTaskStatusLabel(task.status)}`);
  }

  const dateSource =
    interaction?.createdAt ??
    task.completedAt ??
    task.systemClosedAt ??
    task.createdAt;

  return {
    id: `task-${task.id}`,
    day: `#${index + 1}`,
    label,
    status: isPending ? "current" : "done",
    date: dateSource ? formatDateTime(dateSource) : undefined,
    agent: interaction?.author.name,
    note: noteParts.join(" · "),
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

  return [
    ...steps,
    {
      id: "next-action",
      day: "Ação",
      label: "Registrar próxima ação",
      status: "current",
      note:
        steps.length === 0
          ? "Nenhuma interação registrada para esta parcela."
          : undefined,
    },
  ];
}

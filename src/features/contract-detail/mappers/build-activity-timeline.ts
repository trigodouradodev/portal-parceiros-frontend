import type { TimelineStep } from "@/features/contract-detail/types";
import { formatDateTime } from "@/lib/format/date";
import type {
  ActivityHistory,
  ActivityInteractionHistoryItem,
  ActivityTaskSummary,
} from "@/services/dashboard/dashboard.types";

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp_message: "WhatsApp",
  client_call: "Ligação",
  client_visit: "Visita",
};

function getChannelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] ?? channel;
}

function mapTaskToStep(task: ActivityTaskSummary, index: number): TimelineStep {
  const isPending = task.status === "pending";

  return {
    id: `task-${task.id}`,
    day: `#${index + 1}`,
    label: task.stageBadgeLabel,
    status: isPending ? "current" : "done",
    date: formatDateTime(task.createdAt),
    note: `${getChannelLabel(task.channel)} · ${isPending ? "Pendente" : "Concluída"}`,
  };
}

function mapInteractionToStep(
  interaction: ActivityInteractionHistoryItem,
  index: number,
): TimelineStep {
  const parts: string[] = [getChannelLabel(interaction.channel)];

  if (interaction.observation) {
    parts.push(interaction.observation);
  }

  return {
    id: `interaction-${interaction.id}`,
    day: `#${index + 1}`,
    label: interaction.result,
    status: "done",
    date: formatDateTime(interaction.createdAt),
    agent: interaction.author.name,
    note: parts.join(" · "),
  };
}

export function buildActivityTimeline(activity: ActivityHistory): TimelineStep[] {
  const tasksChronological = [...activity.tasks].reverse();
  const interactionsChronological = [...activity.interactions].reverse();

  const taskSteps = tasksChronological.map((task, index) =>
    mapTaskToStep(task, index),
  );

  const interactionSteps = interactionsChronological.map((interaction, index) =>
    mapInteractionToStep(interaction, taskSteps.length + index),
  );

  const merged = [...taskSteps, ...interactionSteps].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const hasCurrent = merged.some((step) => step.status === "current");

  if (!hasCurrent) {
    const currentStep: TimelineStep = {
      id: "next-action",
      day: "Ação",
      label: "Registrar próxima ação",
      status: "current",
      note:
        merged.length === 0
          ? "Nenhuma interação registrada para esta parcela."
          : undefined,
    };
    return [...merged, currentStep];
  }

  return merged;
}

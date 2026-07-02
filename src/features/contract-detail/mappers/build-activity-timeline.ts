import type { TimelineStep } from "@/features/contract-detail/types";
import { formatDateTime } from "@/lib/format/date";
import {
  getChannelRegisterTitle,
  getChannelShortLabel,
} from "@/features/dashboard/utils/charge-channel";
import { getActivityInteractionResultLabel } from "@/services/activities/activity-interaction-labels";
import type {
  ActivityHistory,
  ActivityInteractionHistoryItem,
  ActivityTaskSummary,
} from "@/services/dashboard/dashboard.types";

import { ActivityChannel } from "@/services/dashboard/dashboard.types";

function mapTaskToStep(
  task: ActivityTaskSummary,
  index: number,
  isPending: boolean,
): TimelineStep {
  const channelLabel = getChannelShortLabel(task.channel);

  return {
    id: `task-${task.id}`,
    day: isPending ? "Ação" : `#${index + 1}`,
    label: isPending
      ? getChannelRegisterTitle(task.channel as ActivityChannel)
      : `${channelLabel} · ${task.stageBadgeLabel}`,
    status: isPending ? "current" : "done",
    date: isPending ? undefined : formatDateTime(task.completedAt ?? task.createdAt),
    stageCode: task.stageCode,
    note: isPending
      ? `${channelLabel} · Pendente`
      : `${channelLabel} · Concluída`,
    actionLabel: isPending
      ? getChannelRegisterTitle(task.channel as ActivityChannel)
      : undefined,
  };
}

function mapInteractionToStep(
  interaction: ActivityInteractionHistoryItem,
  index: number,
): TimelineStep {
  const channelLabel = getChannelShortLabel(interaction.channel);
  const outcomeLabel = getActivityInteractionResultLabel(interaction.result);
  const noteParts = [channelLabel];

  if (interaction.observation) {
    noteParts.push(interaction.observation);
  }

  return {
    id: `interaction-${interaction.id}`,
    day: `#${index + 1}`,
    label: outcomeLabel,
    status: "done",
    date: formatDateTime(interaction.createdAt),
    agent: interaction.author.name,
    outcome: outcomeLabel,
    note: noteParts.join(" · "),
  };
}

export function buildActivityTimeline(
  activity: ActivityHistory,
): TimelineStep[] {
  const tasksChronological = [...activity.tasks].reverse();
  const interactionsChronological = [...activity.interactions].reverse();

  const pendingTask = activity.tasks.find((task) => task.status === "pending");

  const completedTasks = tasksChronological.filter(
    (task) => task.status !== "pending",
  );

  const taskSteps = completedTasks.map((task, index) =>
    mapTaskToStep(task, index, false),
  );

  const interactionSteps = interactionsChronological.map((interaction, index) =>
    mapInteractionToStep(interaction, taskSteps.length + index),
  );

  const merged = [...taskSteps, ...interactionSteps].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  if (pendingTask) {
    const pendingStep = mapTaskToStep(
      pendingTask,
      merged.length,
      true,
    );
    return [...merged, pendingStep];
  }

  if (merged.length === 0) {
    return [
      {
        id: "next-action",
        day: "Ação",
        label: "Aguardando régua de cobrança",
        status: "current",
        note: "Nenhuma interação registrada para esta parcela.",
      },
    ];
  }

  return merged;
}

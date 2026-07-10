import type { TodayQueue } from "./activities.types";
import type { InstallmentDetail } from "./installment-detail.types";
import type { QueueTaskCard } from "./activities.types";
import {
  parseActivityInteractionChannel,
  parseActivityInteractionResult,
  parseActivityRecipientType,
  parseActivityTaskStatus,
  parseActivityTaskType,
  parseQueueSegmentCode,
  parseQueueTone,
} from "./activity.enums";

function normalizeQueueTaskCard(card: QueueTaskCard): QueueTaskCard {
  return {
    ...card,
    segmentCode: parseQueueSegmentCode(card.segmentCode),
    tone: parseQueueTone(card.tone),
    taskType: parseActivityTaskType(card.taskType),
    status: parseActivityTaskStatus(card.status),
    lastInteraction: card.lastInteraction
      ? {
          ...card.lastInteraction,
          result: parseActivityInteractionResult(card.lastInteraction.result),
          channel: parseActivityInteractionChannel(
            card.lastInteraction.channel,
          ),
        }
      : card.lastInteraction,
  };
}

export function normalizeTodayQueue(queue: TodayQueue): TodayQueue {
  return {
    ...queue,
    active: queue.active ? normalizeQueueTaskCard(queue.active) : null,
    segments: queue.segments.map((segment) => ({
      ...segment,
      code: parseQueueSegmentCode(segment.code),
    })),
    locked: {
      ...queue.locked,
      items: queue.locked.items.map(normalizeQueueTaskCard),
    },
    scheduled: queue.scheduled.map(normalizeQueueTaskCard),
    completedToday: queue.completedToday.map(normalizeQueueTaskCard),
  };
}

export function normalizeInstallmentDetail(
  detail: InstallmentDetail,
): InstallmentDetail {
  return {
    ...detail,
    tasks: detail.tasks.map((task) => ({
      ...task,
      segmentCode: parseQueueSegmentCode(task.segmentCode),
      tone: parseQueueTone(task.tone),
      taskType: parseActivityTaskType(task.taskType),
      status: parseActivityTaskStatus(task.status),
      interaction: task.interaction
        ? {
            ...task.interaction,
            channel: parseActivityInteractionChannel(task.interaction.channel),
            recipientType: parseActivityRecipientType(
              task.interaction.recipientType,
            ),
            result: parseActivityInteractionResult(task.interaction.result),
          }
        : task.interaction,
    })),
  };
}

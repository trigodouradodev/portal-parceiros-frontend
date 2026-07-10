import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import { getQueueToneLabel } from "@/features/dashboard/constants/charge-queue-tone";
import type { QueueSegmentCode } from "@/services/activities/activity.enums";
import type { QueueTaskCard } from "@/services/activities/activities.types";
import {
  mapTaskTypeToChannel,
  mapToneToStageCode,
} from "@/services/activities/activity-task-mapping";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

const API_SEGMENT_ALIASES: Record<QueueSegmentCode, ChargeQueueSegmentCode> = {
  recent: "recent",
  broken_promise: "broken_promise",
  fpd: "fpd",
  early: "early",
  mid: "mid",
  post_letter: "late",
  pre_default: "critical",
};

const KNOWN_SEGMENTS = new Set<ChargeQueueSegmentCode>([
  "recent",
  "broken_promise",
  "fpd",
  "early",
  "mid",
  "late",
  "critical",
]);

export function normalizeQueueSegmentCode(
  segmentCode: QueueSegmentCode | string,
): ChargeQueueSegmentCode {
  const aliased = API_SEGMENT_ALIASES[segmentCode as QueueSegmentCode];
  if (aliased) return aliased;

  if (KNOWN_SEGMENTS.has(segmentCode as ChargeQueueSegmentCode)) {
    return segmentCode as ChargeQueueSegmentCode;
  }

  return "mid";
}

/** Adapta um card da fila v2 para o shape usado pela UI de cobrança (AUREA-186). */
export function mapQueueTaskCardToOverdueItem(
  card: QueueTaskCard,
): OverdueCollectionItem {
  const stageCode = mapToneToStageCode(card.tone);

  return {
    installment: {
      id: card.installment.id,
      number: card.installment.number,
      label: card.installment.label,
      dueDate: card.installment.dueDate,
      daysOverdue: card.installment.daysOverdue,
      pendingAmount: card.installment.pendingAmount,
      totalAmount: card.installment.totalAmount,
      status: "not_paid",
    },
    contract: {
      id: card.contract.id,
      number: card.contract.number,
      totalInstallments: card.contract.totalInstallments,
      companyName: card.contract.companyName,
    },
    client: {
      name: card.client.name,
      taxId: card.client.taxId,
      phone: card.client.phone,
    },
    task: {
      id: card.taskId,
      stageCode,
      stageBadgeLabel: getQueueToneLabel(card.tone, stageCode),
      channel: mapTaskTypeToChannel(card.taskType),
      status: card.status,
    },
    queueSegmentCode: normalizeQueueSegmentCode(card.segmentCode),
    apiSegmentCode: card.segmentCode,
    queueTone: card.tone,
    queuePosition: card.position,
    correctedAmount: card.installment.amountOverdue,
    lastInteraction: card.lastInteraction ?? undefined,
    wasPostponed: card.wasPostponed,
    wasRescheduled: card.wasRescheduled,
    expireDate: card.expireDate,
    taskType: card.taskType,
    assignedTo: card.assignedTo,
    isActive: card.isActive,
  };
}

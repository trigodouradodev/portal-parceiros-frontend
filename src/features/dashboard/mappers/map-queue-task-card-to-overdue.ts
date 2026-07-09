import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import { getQueueToneLabel } from "@/features/dashboard/constants/charge-queue-tone";
import type { QueueTaskCard } from "@/services/activities/activities.types";
import {
  ActivityChannel,
  type ActivityTaskStatus,
  type CollectionStageCode,
  type OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";

const API_SEGMENT_ALIASES: Record<string, ChargeQueueSegmentCode> = {
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
  segmentCode: string,
): ChargeQueueSegmentCode {
  const aliased = API_SEGMENT_ALIASES[segmentCode];
  if (aliased) return aliased;

  if (KNOWN_SEGMENTS.has(segmentCode as ChargeQueueSegmentCode)) {
    return segmentCode as ChargeQueueSegmentCode;
  }

  return "mid";
}

const TONE_TO_STAGE: Record<string, CollectionStageCode> = {
  friendly: "friendly",
  firm: "assertive",
  severe: "warning",
};

function mapTaskTypeToChannel(taskType: string): ActivityChannel {
  if (taskType === "visit") return ActivityChannel.CLIENT_VISIT;
  return ActivityChannel.CLIENT_CALL;
}

function mapTaskStatus(status: string): ActivityTaskStatus {
  if (
    status === "pending" ||
    status === "completed" ||
    status === "cancelled" ||
    status === "system_closed"
  ) {
    return status;
  }
  return "pending";
}

function mapToneToStageCode(tone: string): CollectionStageCode {
  return TONE_TO_STAGE[tone] ?? "friendly";
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
      status: mapTaskStatus(card.status),
    },
    queueSegmentCode: normalizeQueueSegmentCode(card.segmentCode),
    queueTone: card.tone,
    queuePosition: card.position,
    correctedAmount: card.installment.amountOverdue,
    lastInteraction: card.lastInteraction ?? undefined,
  };
}

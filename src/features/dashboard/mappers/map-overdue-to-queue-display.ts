import type { ChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import { getChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import {
  getQueueToneLabel,
  resolveQueueTone,
} from "@/features/dashboard/constants/charge-queue-tone";
import type { ChargeClient } from "@/features/dashboard/mocks/tasks";
import { mapOverdueItemToChargeClient } from "@/features/dashboard/utils/task-mappers";
import { formatDate } from "@/lib/format/date";
import type { QueueTone } from "@/services/activities/activity.enums";
import {
  ActivityChannel,
  type OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";
import { resolveQueueSegment } from "@/features/dashboard/utils/charge-queue";

export interface ChargeQueueDisplayItem {
  client: ChargeClient;
  segment: ChargeQueueSegmentMeta;
  queuePosition: number;
  originalAmount: number;
  correctedAmount: number;
  overdueInstallmentCount: number;
  consolidatedOverdueAmount: number;
  tone: QueueTone;
  toneLabel: string;
  pendingActionLabel: string;
  contractSubtitle: string;
  contractLabel: string;
  wasPostponed: boolean;
  wasRescheduled: boolean;
  rescheduledDateLabel?: string;
  lastActionNote?: string | null;
}

function getPendingActionLabel(channel?: ActivityChannel): string {
  if (channel === ActivityChannel.CLIENT_VISIT) return "Visita pendente";
  return "Contato pendente";
}

function formatContractLabel(contractNumber: string): string {
  const trimmed = contractNumber.trim();
  if (trimmed.startsWith("#") || trimmed.toLowerCase().startsWith("contrato")) {
    return trimmed;
  }
  return `#${trimmed}`;
}

function buildContractSubtitle(
  contractNumber: string,
  segment: ChargeQueueSegmentMeta,
): string {
  const contractLabel = formatContractLabel(contractNumber);
  const contractText = contractLabel.toLowerCase().startsWith("contrato")
    ? contractLabel
    : `Contrato ${contractLabel}`;
  return `${contractText} · ${segment.sublabel}`;
}

function formatDayMonth(isoDate: string): string {
  return formatDate(isoDate).slice(0, 5);
}

function buildLastActionNote(
  item: OverdueCollectionItem,
  clientLastAction: string | null,
): string | null {
  if (clientLastAction) return clientLastAction;

  const segmentCode = resolveQueueSegment(item);
  if (segmentCode !== "broken_promise") return null;

  const promiseDate = item.lastInteraction?.promiseDate;
  if (promiseDate) {
    return `Promessa para ${formatDayMonth(promiseDate)} não cumprida`;
  }
  return "Promessa não cumprida";
}

export function mapOverdueToQueueDisplay(
  item: OverdueCollectionItem,
  fallbackPosition: number,
): ChargeQueueDisplayItem {
  const client = mapOverdueItemToChargeClient(item);
  const segmentCode = resolveQueueSegment(item);
  const segment = getChargeQueueSegmentMeta(segmentCode);
  const stageCode = item.task?.stageCode;
  const pendingAmount = item.installment.pendingAmount;
  const totalAmount = item.installment.totalAmount;
  const correctedAmount = item.correctedAmount ?? pendingAmount;
  const tone = resolveQueueTone(
    item.queueTone,
    stageCode,
    item.installment.daysOverdue,
  );

  return {
    client,
    segment,
    queuePosition: item.queuePosition ?? fallbackPosition,
    originalAmount: totalAmount,
    correctedAmount,
    overdueInstallmentCount: 1,
    consolidatedOverdueAmount: correctedAmount,
    tone,
    toneLabel: getQueueToneLabel(tone, stageCode),
    pendingActionLabel: getPendingActionLabel(item.task?.channel),
    contractLabel: formatContractLabel(client.contract),
    contractSubtitle: buildContractSubtitle(client.contract, segment),
    wasPostponed: item.wasPostponed ?? false,
    wasRescheduled: item.wasRescheduled ?? false,
    rescheduledDateLabel:
      item.wasRescheduled && item.expireDate
        ? formatDate(item.expireDate)
        : undefined,
    lastActionNote: buildLastActionNote(item, client.lastAction),
  };
}

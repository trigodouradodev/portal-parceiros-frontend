import type { ChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import { getChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import { getQueueToneLabel } from "@/features/dashboard/constants/charge-queue-tone";
import type { ChargeClient } from "@/features/dashboard/mocks/tasks";
import { mapOverdueItemToChargeClient } from "@/features/dashboard/utils/task-mappers";
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
  toneLabel: string;
  pendingActionLabel: string;
  contractSubtitle: string;
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
  overdueDays: number,
): string {
  const contractLabel = formatContractLabel(contractNumber);
  const daysLabel = overdueDays === 1 ? "D+1" : `D+${overdueDays}`;
  if (segment.code === "recent") {
    return `Contrato ${contractLabel} · ${segment.subtitle || daysLabel} · ${segment.description}`;
  }
  return `Contrato ${contractLabel}`;
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

  return {
    client,
    segment,
    queuePosition: item.queuePosition ?? fallbackPosition,
    originalAmount: totalAmount,
    correctedAmount,
    overdueInstallmentCount: 1,
    consolidatedOverdueAmount: correctedAmount,
    toneLabel: getQueueToneLabel(item.queueTone, stageCode),
    pendingActionLabel: getPendingActionLabel(item.task?.channel),
    contractSubtitle: buildContractSubtitle(
      client.contract,
      segment,
      item.installment.daysOverdue,
    ),
  };
}

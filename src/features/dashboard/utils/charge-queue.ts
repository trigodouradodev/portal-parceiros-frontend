import {
  CHARGE_QUEUE_SEGMENT_ORDER,
  getChargeQueueSegmentMeta,
  type ChargeQueueSegmentCode,
  type ChargeQueueSegmentMeta,
} from "@/features/dashboard/constants/charge-queue-segments";
import { normalizeQueueSegmentCode } from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import { ActivityTaskStatus } from "@/services/activities/activity.enums";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

/** Agrupamento e ordenação da fila de cobrança (AUREA-186). */

export interface ChargeQueueSegmentGroup {
  segment: ChargeQueueSegmentMeta;
  items: OverdueCollectionItem[];
}

export interface ChargeQueueFlatEntry {
  item: OverdueCollectionItem;
  globalIndex: number;
  segmentCode: ChargeQueueSegmentCode;
  /**
   * Executável agora (AUREA-319). No fluxo v2 (`buildChargeQueueFromApiCards`),
   * vale para toda pendente do segmento ativo do responsável, não só a #1 —
   * ver `card.isActive`. No fluxo legado (`buildChargeQueue`), continua valendo
   * só pra entrada em `actionableIndex` (comportamento inalterado).
   */
  unlocked: boolean;
}

export interface ChargeQueueView {
  groups: ChargeQueueSegmentGroup[];
  flat: ChargeQueueFlatEntry[];
  actionableIndex: number | null;
}

function isBrokenPromise(item: OverdueCollectionItem): boolean {
  const status = item.followup?.latestStatus?.toLowerCase() ?? "";
  return (
    status === "promise_to_pay" ||
    status.includes("promise") ||
    status.includes("promessa")
  );
}

/**
 * Resolves queue segment from overdue item fields available today.
 * When backend exposes `queueSegment`, prefer that instead.
 */
export function resolveQueueSegment(
  item: OverdueCollectionItem,
): ChargeQueueSegmentCode {
  if (item.queueSegmentCode) {
    return normalizeQueueSegmentCode(item.queueSegmentCode);
  }

  const days = item.installment.daysOverdue;

  if (isBrokenPromise(item)) {
    return "broken_promise";
  }

  if (item.installment.number === 1) {
    return "fpd";
  }

  if (days <= 2) return "recent";
  if (days <= 5) return "early";
  if (days <= 15) return "mid";
  if (days <= 20) return "late";
  return "critical";
}

export function buildChargeQueue(
  items: OverdueCollectionItem[],
): ChargeQueueView {
  const buckets = new Map<ChargeQueueSegmentCode, OverdueCollectionItem[]>();

  for (const code of CHARGE_QUEUE_SEGMENT_ORDER) {
    buckets.set(code, []);
  }

  for (const item of items) {
    const code = resolveQueueSegment(item);
    buckets.get(code)!.push(item);
  }

  const groups: ChargeQueueSegmentGroup[] = [];
  const flat: ChargeQueueFlatEntry[] = [];
  let globalIndex = 0;

  for (const code of CHARGE_QUEUE_SEGMENT_ORDER) {
    const segmentItems = buckets.get(code)!;
    if (segmentItems.length === 0) continue;

    segmentItems.sort(
      (a, b) => b.installment.daysOverdue - a.installment.daysOverdue,
    );

    groups.push({
      segment: getChargeQueueSegmentMeta(code),
      items: segmentItems,
    });

    for (const item of segmentItems) {
      flat.push({ item, globalIndex, segmentCode: code, unlocked: false });
      globalIndex += 1;
    }
  }

  const actionableIndex =
    flat.find((entry) => entry.item.task?.status === ActivityTaskStatus.PENDING)
      ?.globalIndex ?? null;

  // Fluxo legado: só a #1 da fila fica desbloqueada (comportamento inalterado).
  if (actionableIndex !== null) {
    flat[actionableIndex].unlocked = true;
  }

  return { groups, flat, actionableIndex };
}

export function isQueueItemActionable(
  unlocked: boolean,
  hasPendingTask: boolean,
): boolean {
  return hasPendingTask && unlocked;
}

export function isChargeQueueItemBlocked(
  queue: ChargeQueueView,
  item: OverdueCollectionItem,
): boolean {
  const entry = queue.flat.find(
    (queueEntry) => queueEntry.item.task?.id === item.task?.id,
  );
  if (!entry) return true;

  const hasPendingTask = item.task?.status === ActivityTaskStatus.PENDING;
  return !isQueueItemActionable(entry.unlocked, hasPendingTask);
}

import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import { getChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import { mapOverdueToQueueDisplay } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import type {
  ChargeQueueBlockView,
  ChargeQueueRowView,
  ChargeQueueTabView,
} from "@/features/dashboard/types/charge-queue-tab-view";
import {
  isQueueItemActionable,
  type ChargeQueueView,
} from "@/features/dashboard/utils/charge-queue";

export interface BuildChargeQueueTabViewOptions {
  segmentCounts?: Record<string, number>;
}

export function buildChargeQueueTabView(
  queue: ChargeQueueView,
  options?: BuildChargeQueueTabViewOptions,
): ChargeQueueTabView {
  const heroEntry =
    queue.actionableIndex !== null
      ? queue.flat.find((entry) => entry.globalIndex === queue.actionableIndex)
      : null;

  const hero = heroEntry
    ? {
        item: heroEntry.item,
        display: mapOverdueToQueueDisplay(
          heroEntry.item,
          heroEntry.globalIndex + 1,
        ),
        taskChannel: heroEntry.item.task?.channel,
      }
    : null;

  const blocks: ChargeQueueBlockView[] = [];
  let currentCode: ChargeQueueSegmentCode | null = null;

  for (const entry of queue.flat) {
    if (entry.globalIndex === queue.actionableIndex) continue;

    const hasPendingTask = entry.item.task?.status === "pending";
    const row: ChargeQueueRowView = {
      key: entry.item.installment.id,
      item: entry.item,
      display: mapOverdueToQueueDisplay(entry.item, entry.globalIndex + 1),
      locked: !isQueueItemActionable(
        entry.globalIndex,
        queue.actionableIndex,
        hasPendingTask,
      ),
    };

    if (entry.segmentCode !== currentCode) {
      currentCode = entry.segmentCode;
      blocks.push({
        key: `${currentCode}-${entry.item.installment.id}`,
        segment: getChargeQueueSegmentMeta(currentCode),
        segmentCount: options?.segmentCounts?.[currentCode],
        rows: [row],
      });
      continue;
    }

    blocks[blocks.length - 1].rows.push(row);
  }

  return { hero, compactHeader: hero !== null, blocks };
}

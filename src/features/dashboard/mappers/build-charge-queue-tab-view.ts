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
import { ActivityTaskStatus } from "@/services/activities/activity.enums";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

export interface BuildChargeQueueTabViewOptions {
  segmentCounts?: Record<string, number>;
}

function buildHeroView(entry: {
  item: OverdueCollectionItem;
  globalIndex: number;
  segmentCode: ChargeQueueSegmentCode;
}) {
  const taskChannel = entry.item.task?.channel;
  return {
    item: entry.item,
    display: mapOverdueToQueueDisplay(entry.item, entry.globalIndex + 1),
    taskChannel,
    canPostpone: !entry.item.wasPostponed,
    canRescheduleVisit:
      taskChannel === ActivityChannel.CLIENT_VISIT &&
      !entry.item.wasRescheduled,
    segmentCode: entry.segmentCode,
  };
}

export function buildChargeQueueTabView(
  queue: ChargeQueueView,
  options?: BuildChargeQueueTabViewOptions,
): ChargeQueueTabView {
  const heroEntry =
    queue.actionableIndex !== null
      ? queue.flat.find((entry) => entry.globalIndex === queue.actionableIndex)
      : null;

  const hero = heroEntry ? buildHeroView(heroEntry) : null;

  const blocks: ChargeQueueBlockView[] = [];
  let currentCode: ChargeQueueSegmentCode | null = null;

  for (const entry of queue.flat) {
    if (entry.globalIndex === queue.actionableIndex) continue;

    const hasPendingTask =
      entry.item.task?.status === ActivityTaskStatus.PENDING;
    // AUREA-319: mesmos campos do Hero — uma linha desbloqueada (mesmo
    // segmento da recomendada) precisa dos mesmos dados pra renderizar como
    // card de ação completo, não só como linha compacta.
    const row: ChargeQueueRowView = {
      key: entry.item.installment.id,
      ...buildHeroView(entry),
      locked: !isQueueItemActionable(entry.unlocked, hasPendingTask),
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

  return { hero, blocks };
}

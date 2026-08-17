import {
  getChargeQueueSegmentMeta,
  type ChargeQueueSegmentCode,
} from "@/features/dashboard/constants/charge-queue-segments";
import {
  mapQueueTaskCardToOverdueItem,
  normalizeQueueSegmentCode,
} from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import type {
  ChargeQueueFlatEntry,
  ChargeQueueSegmentGroup,
  ChargeQueueView,
} from "@/features/dashboard/utils/charge-queue";
import type { QueueTaskCard } from "@/services/activities/activities.types";
import { ActivityTaskStatus } from "@/services/activities/activity.enums";

/** Monta a fila preservando ordem e segmentos vindos da API v2 (`/activities/tasks/today`). */
export function buildChargeQueueFromApiCards(
  cards: QueueTaskCard[],
): ChargeQueueView {
  const flat: ChargeQueueFlatEntry[] = cards.map((card, globalIndex) => {
    const item = mapQueueTaskCardToOverdueItem(card);
    return {
      item,
      globalIndex,
      segmentCode: normalizeQueueSegmentCode(card.segmentCode),
      // AUREA-319: toda pendente do segmento ativo do responsável é executável,
      // não só a recomendada — is_active já vem assim calculado do backend.
      unlocked: card.isActive,
    };
  });

  const groups: ChargeQueueSegmentGroup[] = [];
  let currentCode: ChargeQueueSegmentCode | null = null;

  for (const entry of flat) {
    if (entry.segmentCode !== currentCode) {
      currentCode = entry.segmentCode;
      groups.push({
        segment: getChargeQueueSegmentMeta(currentCode),
        items: [entry.item],
      });
      continue;
    }

    groups[groups.length - 1].items.push(entry.item);
  }

  // Hero = a recomendada (isRecommended), não "a primeira com isActive" — desde
  // AUREA-319 isActive pode valer para várias tarefas do mesmo segmento.
  const recommendedIndex = cards.findIndex((card) => card.isRecommended);
  const actionableIndex =
    recommendedIndex >= 0
      ? recommendedIndex
      : (flat.find(
          (entry) => entry.item.task?.status === ActivityTaskStatus.PENDING,
        )?.globalIndex ?? null);

  return { groups, flat, actionableIndex };
}

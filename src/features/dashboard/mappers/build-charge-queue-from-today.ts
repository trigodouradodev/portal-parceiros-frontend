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

/** Monta a fila preservando ordem e segmentos vindos da API v2 (`/activities/tasks/today`). */
export function buildChargeQueueFromApiCards(
  cards: QueueTaskCard[],
  canInteractWithTask: (task: QueueTaskCard) => boolean,
): ChargeQueueView {
  const flat: ChargeQueueFlatEntry[] = cards.map((card, globalIndex) => {
    const item = mapQueueTaskCardToOverdueItem(card);
    return {
      item,
      globalIndex,
      segmentCode: normalizeQueueSegmentCode(card.segmentCode),
      // Todas as pendentes do segmento ativo do usuário autenticado são
      // executáveis. Uma fila de subordinado é apenas para visualização.
      unlocked: canInteractWithTask(card),
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

  // Hero = a recomendada executável; as demais do segmento ativo também ficam
  // executáveis como cards secundários.
  const actionableIndex = cards.findIndex(
    (card) => card.isRecommended && canInteractWithTask(card),
  );

  return {
    groups,
    flat,
    actionableIndex: actionableIndex >= 0 ? actionableIndex : null,
  };
}

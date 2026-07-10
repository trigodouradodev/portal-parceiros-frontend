import { useMemo, type RefObject } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  ChargeQueueCompactRow,
  DoneCard,
} from "@/features/dashboard/components/task-cards";
import { ChargeQueueHeroCard } from "@/features/dashboard/components/task-cards/ChargeQueueHeroCard";
import { ChargeQueueSectionHeader } from "@/features/dashboard/components/tasks/ChargeQueueSectionHeader";
import { ChargeQueueSegmentHeader } from "@/features/dashboard/components/tasks/ChargeQueueSegmentHeader";
import { ChargeQueueSkeleton } from "@/features/dashboard/components/tasks/ChargeQueueSkeleton";
import { TaskCardSkeleton } from "@/features/dashboard/components/tasks/TaskCardSkeleton";
import { buildChargeQueueTabView } from "@/features/dashboard/mappers/build-charge-queue-tab-view";
import { mapOverdueToQueueDisplay } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import {
  buildChargeQueue,
  type ChargeQueueView,
} from "@/features/dashboard/utils/charge-queue";
import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

interface ChargeTasksTabProps {
  isLoading: boolean;
  items: OverdueCollectionItem[];
  onOpen: (item: OverdueCollectionItem) => void;
  onAction: (item: OverdueCollectionItem) => void;
  onPostpone: (item: OverdueCollectionItem) => void;
  onRescheduleVisit: (item: OverdueCollectionItem, date: string) => void;
  isPostponing?: boolean;
  isRescheduling?: boolean;
  hasNextPage: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  /** Quando informado, usa a fila v2 já ordenada pela API. */
  queueView?: ChargeQueueView;
  /** Totais por segmento vindos da API (`TodayQueue.segments`). */
  segmentCounts?: Partial<Record<ChargeQueueSegmentCode, number>>;
  scheduledItems?: OverdueCollectionItem[];
  completedTodayItems?: OverdueCollectionItem[];
  onOpenDetail?: (item: OverdueCollectionItem) => void;
}

/** Fila segmentada de cobrança na Home (AUREA-186). */
export function ChargeTasksTab({
  isLoading,
  items,
  onOpen,
  onAction,
  onPostpone,
  onRescheduleVisit,
  isPostponing = false,
  isRescheduling = false,
  hasNextPage,
  loadMoreRef,
  queueView: queueViewProp,
  segmentCounts,
  scheduledItems = [],
  completedTodayItems = [],
  onOpenDetail,
}: ChargeTasksTabProps) {
  const queueView = useMemo(
    () => queueViewProp ?? buildChargeQueue(items),
    [queueViewProp, items],
  );

  const tabView = useMemo(
    () => buildChargeQueueTabView(queueView, { segmentCounts }),
    [queueView, segmentCounts],
  );

  const openDetail = onOpenDetail ?? onOpen;

  if (isLoading) {
    return <ChargeQueueSkeleton />;
  }

  const hasSecondarySections =
    scheduledItems.length > 0 || completedTodayItems.length > 0;

  if (items.length === 0 && !hasNextPage && !hasSecondarySections) {
    return <EmptyState label="Nenhuma cobrança pendente hoje." />;
  }

  const { hero, compactHeader, blocks } = tabView;

  return (
    <div className="flex flex-col gap-4">
      {hero && (
        <ChargeQueueHeroCard
          display={hero.display}
          taskChannel={hero.taskChannel}
          canPostpone={hero.canPostpone}
          canRescheduleVisit={hero.canRescheduleVisit}
          onOpen={() => onOpen(hero.item)}
          onWhatsApp={() => onAction(hero.item)}
          onCall={() => onAction(hero.item)}
          onVisit={() => onAction(hero.item)}
          onPostpone={() => onPostpone(hero.item)}
          onRescheduleVisit={(date) => onRescheduleVisit(hero.item, date)}
          isPostponing={isPostponing}
          isRescheduling={isRescheduling}
        />
      )}

      {blocks.map((block) => (
        <section key={block.key} className="flex flex-col gap-2">
          <ChargeQueueSegmentHeader
            segment={block.segment}
            count={block.segmentCount ?? block.rows.length}
            compact={compactHeader}
          />
          {block.rows.map((row) => (
            <ChargeQueueCompactRow
              key={row.key}
              display={row.display}
              locked={row.locked}
              onOpen={() => onOpen(row.item)}
            />
          ))}
        </section>
      ))}

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex flex-col gap-3 pt-1">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      )}

      {scheduledItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <ChargeQueueSectionHeader
            title="Agendadas"
            count={scheduledItems.length}
          />
          {scheduledItems.map((item, index) => (
            <ChargeQueueCompactRow
              key={item.installment.id}
              display={mapOverdueToQueueDisplay(item, index + 1)}
              locked
              onOpen={() => openDetail(item)}
            />
          ))}
        </section>
      )}

      {completedTodayItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <ChargeQueueSectionHeader
            title="Concluídas hoje"
            count={completedTodayItems.length}
          />
          {completedTodayItems.map((item) => (
            <button
              key={item.installment.id}
              type="button"
              className="w-full text-left"
              onClick={() => openDetail(item)}
            >
              <DoneCard
                name={item.client.name}
                contract={`${item.contract.number} · ${item.installment.label}`}
                label="Ação concluída hoje"
              />
            </button>
          ))}
        </section>
      )}
    </div>
  );
}

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  ChargeQueueCompactRow,
  DoneCard,
} from "@/features/dashboard/components/task-cards";
import { ChargeQueueHeroCard } from "@/features/dashboard/components/task-cards/ChargeQueueHeroCard";
import { ChargeQueueSectionHeader } from "@/features/dashboard/components/tasks/ChargeQueueSectionHeader";
import { ChargeQueueSegmentHeader } from "@/features/dashboard/components/tasks/ChargeQueueSegmentHeader";
import { ChargeQueueSkeleton } from "@/features/dashboard/components/tasks/ChargeQueueSkeleton";
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
  onWhatsApp?: (item: OverdueCollectionItem) => void;
  onCall?: (item: OverdueCollectionItem) => void;
  onVisit?: (item: OverdueCollectionItem) => void;
  onPostpone: (item: OverdueCollectionItem) => void;
  onRescheduleVisit: (item: OverdueCollectionItem, date: string) => void;
  isPostponing?: boolean;
  isRescheduling?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  queueView?: ChargeQueueView;
  segmentCounts?: Partial<Record<ChargeQueueSegmentCode, number>>;
  scheduledItems?: OverdueCollectionItem[];
  completedTodayItems?: OverdueCollectionItem[];
  onOpenDetail?: (item: OverdueCollectionItem) => void;
  highlightedInstallmentId?: string | null;
  pinnedPostponedItem?: OverdueCollectionItem | null;
  queueTotal?: number;
}

/** Fila segmentada de cobrança na Home (AUREA-186). */
export function ChargeTasksTab({
  isLoading,
  items,
  onOpen,
  onAction,
  onWhatsApp,
  onCall,
  onVisit,
  onPostpone,
  onRescheduleVisit,
  isPostponing = false,
  isRescheduling = false,
  hasNextPage,
  isFetchingNextPage = false,
  onLoadMore,
  queueView: queueViewProp,
  segmentCounts,
  scheduledItems = [],
  completedTodayItems = [],
  onOpenDetail,
  highlightedInstallmentId = null,
  pinnedPostponedItem = null,
  queueTotal,
}: ChargeTasksTabProps) {
  const pinnedInstallmentId = pinnedPostponedItem?.installment.id ?? null;

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

  if (
    items.length === 0 &&
    !hasNextPage &&
    !hasSecondarySections &&
    !pinnedPostponedItem
  ) {
    return <EmptyState label="Nenhuma cobrança pendente hoje." />;
  }

  const { hero, blocks } = tabView;
  const pinnedDisplay = pinnedPostponedItem
    ? mapOverdueToQueueDisplay(
        pinnedPostponedItem,
        pinnedPostponedItem.queuePosition ?? 1,
      )
    : null;

  return (
    <div className="flex flex-col gap-1.5">
      {hero && hero.item.installment.id !== pinnedInstallmentId && (
        <ChargeQueueHeroCard
          display={hero.display}
          taskChannel={hero.taskChannel}
          queueTotal={queueTotal}
          canPostpone={hero.canPostpone}
          canRescheduleVisit={hero.canRescheduleVisit}
          onOpen={() => onOpen(hero.item)}
          onWhatsApp={() => (onWhatsApp ?? onAction)(hero.item)}
          onCall={() => (onCall ?? onAction)(hero.item)}
          onVisit={() => (onVisit ?? onAction)(hero.item)}
          onPostpone={() => onPostpone(hero.item)}
          onRescheduleVisit={(date) => onRescheduleVisit(hero.item, date)}
          isPostponing={isPostponing}
          isRescheduling={isRescheduling}
        />
      )}

      {pinnedPostponedItem && pinnedDisplay && (
        <section className="flex flex-col gap-2">
          <ChargeQueueSectionHeader title="Recém postergada" count={1} />
          <ChargeQueueCompactRow
            display={pinnedDisplay}
            locked={false}
            installmentId={pinnedPostponedItem.installment.id}
            highlighted={
              pinnedPostponedItem.installment.id === highlightedInstallmentId
            }
            onOpen={() => openDetail(pinnedPostponedItem)}
          />
        </section>
      )}

      {blocks.map((block) => {
        const rows = block.rows.filter(
          (row) => row.item.installment.id !== pinnedInstallmentId,
        );
        if (rows.length === 0) return null;

        return (
          <section key={block.key} className="flex flex-col gap-2">
            <ChargeQueueSegmentHeader
              segment={block.segment}
              count={block.segmentCount ?? rows.length}
            />
            {rows.map((row) => (
              <ChargeQueueCompactRow
                key={row.key}
                display={row.display}
                locked={row.locked}
                installmentId={row.item.installment.id}
                highlighted={
                  row.item.installment.id === highlightedInstallmentId
                }
                onOpen={() => onOpen(row.item)}
              />
            ))}
          </section>
        );
      })}

      {hasNextPage && (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl"
          disabled={isFetchingNextPage || !onLoadMore}
          onClick={() => onLoadMore?.()}
        >
          {isFetchingNextPage ? "Carregando..." : "Ver mais"}
        </Button>
      )}

      {scheduledItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <ChargeQueueSectionHeader
            title="Agendadas"
            count={scheduledItems.length}
          />
          {scheduledItems
            .filter((item) => item.installment.id !== pinnedInstallmentId)
            .map((item, index) => (
              <ChargeQueueCompactRow
                key={item.installment.id}
                display={mapOverdueToQueueDisplay(item, index + 1)}
                locked
                installmentId={item.installment.id}
                highlighted={item.installment.id === highlightedInstallmentId}
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
            <DoneCard
              key={item.installment.id}
              name={item.client.name}
              contract={`${item.contract.number} · ${item.installment.label}`}
              label="Ação concluída hoje"
            />
          ))}
        </section>
      )}
    </div>
  );
}

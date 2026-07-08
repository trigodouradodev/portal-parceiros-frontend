import { useMemo, type RefObject } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ChargeQueueCompactRow } from "@/features/dashboard/components/task-cards/ChargeQueueCompactRow";
import { ChargeQueueHeroCard } from "@/features/dashboard/components/task-cards/ChargeQueueHeroCard";
import { ChargeQueueSegmentHeader } from "@/features/dashboard/components/tasks/ChargeQueueSegmentHeader";
import { ChargeQueueSkeleton } from "@/features/dashboard/components/tasks/ChargeQueueSkeleton";
import { TaskCardSkeleton } from "@/features/dashboard/components/tasks/TaskCardSkeleton";
import { buildChargeQueueTabView } from "@/features/dashboard/mappers/build-charge-queue-tab-view";
import { buildChargeQueue } from "@/features/dashboard/utils/charge-queue";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

interface ChargeTasksTabProps {
  isLoading: boolean;
  items: OverdueCollectionItem[];
  onOpen: (item: OverdueCollectionItem) => void;
  onAction: (item: OverdueCollectionItem) => void;
  hasNextPage: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

/** Fila segmentada de cobrança na Home (AUREA-186). */
export function ChargeTasksTab({
  isLoading,
  items,
  onOpen,
  onAction,
  hasNextPage,
  loadMoreRef,
}: ChargeTasksTabProps) {
  const queueView = useMemo(
    () => buildChargeQueueTabView(buildChargeQueue(items)),
    [items],
  );

  if (isLoading) {
    return <ChargeQueueSkeleton />;
  }

  if (items.length === 0 && !hasNextPage) {
    return <EmptyState label="Nenhuma cobrança pendente hoje." />;
  }

  const { hero, compactHeader, blocks } = queueView;

  return (
    <div className="flex flex-col gap-4">
      {hero && (
        <ChargeQueueHeroCard
          display={hero.display}
          taskChannel={hero.taskChannel}
          onOpen={() => onOpen(hero.item)}
          onWhatsApp={() => onAction(hero.item)}
          onCall={() => onAction(hero.item)}
          onVisit={() => onAction(hero.item)}
        />
      )}

      {blocks.map((block) => (
        <section key={block.key} className="flex flex-col gap-2">
          <ChargeQueueSegmentHeader
            segment={block.segment}
            count={block.rows.length}
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
    </div>
  );
}

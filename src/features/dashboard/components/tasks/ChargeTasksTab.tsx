import { useMemo, type RefObject } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ChargeQueueCompactRow } from "@/features/dashboard/components/task-cards/ChargeQueueCompactRow";
import { ChargeQueueHeroCard } from "@/features/dashboard/components/task-cards/ChargeQueueHeroCard";
import { ChargeQueueSegmentHeader } from "@/features/dashboard/components/tasks/ChargeQueueSegmentHeader";
import { TaskCardSkeleton } from "@/features/dashboard/components/tasks/TaskCardSkeleton";
import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import { getChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import {
  buildChargeQueue,
  isQueueItemActionable,
} from "@/features/dashboard/utils/charge-queue";
import { mapOverdueToQueueDisplay } from "@/features/dashboard/utils/map-queue-display";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

interface ChargeTasksTabProps {
  isLoading: boolean;
  items: OverdueCollectionItem[];
  onOpen: (item: OverdueCollectionItem) => void;
  onAction: (item: OverdueCollectionItem) => void;
  hasNextPage: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

function ChargeQueueSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
    </div>
  );
}

interface RemainingSegmentBlock {
  segmentCode: ChargeQueueSegmentCode;
  entries: ReturnType<typeof buildChargeQueue>["flat"];
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
  const queue = useMemo(() => buildChargeQueue(items), [items]);

  const heroEntry =
    queue.actionableIndex !== null
      ? queue.flat.find((entry) => entry.globalIndex === queue.actionableIndex)
      : null;

  const remainingEntries = useMemo(
    () =>
      queue.flat.filter((entry) => entry.globalIndex !== queue.actionableIndex),
    [queue.flat, queue.actionableIndex],
  );

  const remainingBlocks = useMemo(() => {
    const blocks: RemainingSegmentBlock[] = [];
    let currentCode: ChargeQueueSegmentCode | null = null;

    for (const entry of remainingEntries) {
      if (entry.segmentCode !== currentCode) {
        currentCode = entry.segmentCode;
        blocks.push({ segmentCode: currentCode, entries: [entry] });
      } else {
        blocks[blocks.length - 1].entries.push(entry);
      }
    }

    return blocks;
  }, [remainingEntries]);

  if (isLoading) {
    return <ChargeQueueSkeleton />;
  }

  if (items.length === 0 && !hasNextPage) {
    return <EmptyState label="Nenhuma cobrança pendente hoje." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {heroEntry && (
        <ChargeQueueHeroCard
          display={mapOverdueToQueueDisplay(
            heroEntry.item,
            heroEntry.globalIndex + 1,
          )}
          taskChannel={heroEntry.item.task?.channel}
          onOpen={() => onOpen(heroEntry.item)}
          onWhatsApp={() => onAction(heroEntry.item)}
          onCall={() => onAction(heroEntry.item)}
          onVisit={() => onAction(heroEntry.item)}
        />
      )}

      {remainingBlocks.map((block) => {
        const segment = getChargeQueueSegmentMeta(block.segmentCode);
        const useCompactHeader = Boolean(heroEntry);

        return (
          <section
            key={`${block.segmentCode}-${block.entries[0]?.item.installment.id}`}
            className="flex flex-col gap-2"
          >
            <ChargeQueueSegmentHeader
              segment={segment}
              count={block.entries.length}
              compact={useCompactHeader}
            />
            {block.entries.map((entry) => {
              const hasPendingTask = entry.item.task?.status === "pending";
              const isActionable = isQueueItemActionable(
                entry.globalIndex,
                queue.actionableIndex,
                hasPendingTask,
              );

              return (
                <ChargeQueueCompactRow
                  key={entry.item.installment.id}
                  display={mapOverdueToQueueDisplay(
                    entry.item,
                    entry.globalIndex + 1,
                  )}
                  locked={!isActionable}
                  onOpen={() => onOpen(entry.item)}
                />
              );
            })}
          </section>
        );
      })}

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex flex-col gap-3 pt-1">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      )}
    </div>
  );
}

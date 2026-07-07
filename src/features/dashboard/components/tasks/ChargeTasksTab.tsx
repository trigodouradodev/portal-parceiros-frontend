import { useMemo, type RefObject } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ChargeQueueCompactRow } from "@/features/dashboard/components/task-cards/ChargeQueueCompactRow";
import { ChargeQueueHeroCard } from "@/features/dashboard/components/task-cards/ChargeQueueHeroCard";
import { ChargeQueueSegmentHeader } from "@/features/dashboard/components/tasks/ChargeQueueSegmentHeader";
import { TaskCardSkeleton } from "@/features/dashboard/components/tasks/TaskCardSkeleton";
import type {
  ChargeQueueSegmentCode,
  ChargeQueueSegmentMeta,
} from "@/features/dashboard/constants/charge-queue-segments";
import { getChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import {
  buildChargeQueue,
  isQueueItemActionable,
  type ChargeQueueView,
} from "@/features/dashboard/utils/charge-queue";
import {
  mapOverdueToQueueDisplay,
  type ChargeQueueDisplayItem,
} from "@/features/dashboard/utils/map-queue-display";
import type {
  ActivityChannel,
  OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";

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

interface ChargeQueueRowView {
  key: string;
  item: OverdueCollectionItem;
  display: ChargeQueueDisplayItem;
  locked: boolean;
}

interface ChargeQueueBlockView {
  key: string;
  segment: ChargeQueueSegmentMeta;
  rows: ChargeQueueRowView[];
}

interface ChargeQueueHeroView {
  item: OverdueCollectionItem;
  display: ChargeQueueDisplayItem;
  taskChannel?: ActivityChannel;
}

interface ChargeQueueTabView {
  hero: ChargeQueueHeroView | null;
  compactHeader: boolean;
  blocks: ChargeQueueBlockView[];
}

function buildChargeQueueTabView(queue: ChargeQueueView): ChargeQueueTabView {
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
        rows: [row],
      });
      continue;
    }

    blocks[blocks.length - 1].rows.push(row);
  }

  return { hero, compactHeader: hero !== null, blocks };
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

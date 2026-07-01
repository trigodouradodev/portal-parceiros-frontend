import type { RefObject } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ChargeTaskCard } from "@/features/dashboard/components/task-cards";
import { TaskCardSkeleton } from "@/features/dashboard/components/tasks/TaskCardSkeleton";
import {
  mapOverdueItemToChargeClient,
  mapTaskToChargeStage,
} from "@/features/dashboard/utils/task-mappers";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

const GRID_CLASS =
  "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

interface ChargeTasksTabProps {
  isLoading: boolean;
  items: OverdueCollectionItem[];
  onOpen: (item: OverdueCollectionItem) => void;
  onAction: (item: OverdueCollectionItem) => void;
  hasNextPage: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

export function ChargeTasksTab({
  isLoading,
  items,
  onOpen,
  onAction,
  hasNextPage,
  loadMoreRef,
}: ChargeTasksTabProps) {
  if (isLoading) {
    return (
      <div className={GRID_CLASS}>
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {items.map((item) => {
        const canRegister = item.task?.status === "pending";
        const stage = item.task
          ? mapTaskToChargeStage(item.task)
          : mapOverdueItemToChargeClient(item).stage;

        return (
          <ChargeTaskCard
            key={item.installment.id}
            client={mapOverdueItemToChargeClient(item)}
            stage={stage}
            canRegister={canRegister}
            onOpen={() => onOpen(item)}
            onAction={() => onAction(item)}
          />
        );
      })}

      {hasNextPage && (
        <>
          <div ref={loadMoreRef}>
            <TaskCardSkeleton />
          </div>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </>
      )}

      {items.length === 0 && !hasNextPage && (
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
          <EmptyState label="Nenhuma cobrança pendente hoje." />
        </div>
      )}
    </div>
  );
}

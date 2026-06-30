import type { RefObject } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChargeTaskCard,
  DoneCard,
} from "@/features/dashboard/components/task-cards";
import { TaskCardSkeleton } from "@/features/dashboard/components/tasks/TaskCardSkeleton";
import type { ChargeStage } from "@/features/dashboard/mocks/tasks";
import { mapOverdueItemToChargeClient } from "@/features/dashboard/utils/task-mappers";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

const GRID_CLASS =
  "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

interface ChargeTasksTabProps {
  isLoading: boolean;
  items: OverdueCollectionItem[];
  getStage: (item: OverdueCollectionItem) => ChargeStage;
  onOpen: (item: OverdueCollectionItem) => void;
  onAction: (item: OverdueCollectionItem) => void;
  onReopen: (installmentId: string) => void;
  hasNextPage: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

export function ChargeTasksTab({
  isLoading,
  items,
  getStage,
  onOpen,
  onAction,
  onReopen,
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

  const pending = items.filter((item) => getStage(item) !== "paid");
  const done = items.filter((item) => getStage(item) === "paid");

  return (
    <div className={GRID_CLASS}>
      {pending.map((item) => (
        <ChargeTaskCard
          key={item.installment.id}
          client={mapOverdueItemToChargeClient(item)}
          stage={getStage(item)}
          onOpen={() => onOpen(item)}
          onAction={() => onAction(item)}
        />
      ))}

      {done.map((item) => (
        <DoneCard
          key={item.installment.id}
          name={item.client.name}
          contract={item.contract.number}
          label="Pagamento confirmado"
          onReopen={() => onReopen(item.installment.id)}
        />
      ))}

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

      {pending.length === 0 && !hasNextPage && (
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
          <EmptyState label="Nenhuma cobrança pendente hoje." />
        </div>
      )}
    </div>
  );
}

import type { RefObject } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CobrTaskCard,
  DoneCard,
} from "@/features/dashboard/components/task-cards";
import { TaskCardSkeleton } from "@/features/dashboard/components/tasks/TaskCardSkeleton";
import type { CobrStage } from "@/features/dashboard/mocks/tasks";
import { mapOverdueContractToCobrClient } from "@/features/dashboard/utils/task-mappers";
import type { OverdueContract } from "@/services/dashboard/dashboard.types";

const GRID_CLASS =
  "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

interface CobrTasksTabProps {
  isLoading: boolean;
  contracts: OverdueContract[];
  getStage: (contract: OverdueContract) => CobrStage;
  onAction: (name: string) => void;
  onReopen: (contractId: string) => void;
  hasNextPage: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

export function CobrTasksTab({
  isLoading,
  contracts,
  getStage,
  onAction,
  onReopen,
  hasNextPage,
  loadMoreRef,
}: CobrTasksTabProps) {
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

  const pending = contracts.filter((c) => getStage(c) !== "paid");
  const done = contracts.filter((c) => getStage(c) === "paid");

  return (
    <div className={GRID_CLASS}>
      {pending.map((c) => (
        <CobrTaskCard
          key={c.contractId}
          client={mapOverdueContractToCobrClient(c)}
          stage={getStage(c)}
          onAction={() => onAction(c.clientName)}
        />
      ))}

      {done.map((c) => (
        <DoneCard
          key={c.contractId}
          name={c.clientName}
          contract={c.contractNumber}
          label="Pagamento confirmado"
          onReopen={() => onReopen(c.contractId)}
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

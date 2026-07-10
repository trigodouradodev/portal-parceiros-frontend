import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import { normalizeQueueSegmentCode } from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import { dashboardKeys } from "@/hooks/useDashboard";
import { activitiesService } from "@/services/activities/activities.service";
import type {
  QueueTaskCard,
  RescheduleTaskPayload,
  SegmentSummary,
} from "@/services/activities/activities.types";

export const activitiesKeys = {
  all: ["activities"] as const,
  todayQueueInfinite: (limit: number) =>
    [...activitiesKeys.all, "today-queue", "infinite", limit] as const,
};

export function flattenTodayQueueCards(
  pages: { active: QueueTaskCard | null; locked: { items: QueueTaskCard[] } }[],
): QueueTaskCard[] {
  if (pages.length === 0) return [];

  const active = pages[0].active;
  const locked = pages.flatMap((page) => page.locked.items);

  if (!active) return locked;

  const lockedWithoutActive = locked.filter(
    (card) => card.taskId !== active.taskId,
  );

  return [active, ...lockedWithoutActive];
}

export function buildSegmentCountsFromApi(
  segments: SegmentSummary[],
): Partial<Record<ChargeQueueSegmentCode, number>> {
  const counts: Partial<Record<ChargeQueueSegmentCode, number>> = {};

  for (const segment of segments) {
    const code = normalizeQueueSegmentCode(segment.code);
    counts[code] = (counts[code] ?? 0) + segment.count;
  }

  return counts;
}

/**
 * Fila "Ações de hoje" (Cobrança v2) com scroll infinito no bloco `locked`.
 */
export function useTodayQueueInfinite(limit = 30) {
  return useInfiniteQuery({
    queryKey: activitiesKeys.todayQueueInfinite(limit),
    queryFn: ({ pageParam = 1 }) =>
      activitiesService.getTodayQueue(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.locked.pagination.hasNextPage) {
        return lastPage.locked.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000,
  });
}

export function usePostponeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => activitiesService.postponeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useRescheduleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: RescheduleTaskPayload;
    }) => activitiesService.rescheduleTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

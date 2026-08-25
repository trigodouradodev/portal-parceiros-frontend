import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import { normalizeQueueSegmentCode } from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import { dashboardKeys } from "@/hooks/useDashboard";
import { installmentKeys } from "@/hooks/useInstallmentDetail";
import { quoteActivityPermissionsKeys } from "@/hooks/useQuoteActivityPermissions";
import { activitiesService } from "@/services/activities/activities.service";
import type {
  QueueTaskCard,
  RescheduleTaskPayload,
  SegmentSummary,
  TodayQueue,
} from "@/services/activities/activities.types";

export const activitiesKeys = {
  all: ["activities"] as const,
  subordinates: () => [...activitiesKeys.all, "subordinates"] as const,
  todayQueueInfinite: (limit: number, assignedToId?: string) =>
    [
      ...activitiesKeys.all,
      "today-queue",
      "infinite",
      limit,
      assignedToId ?? "mine",
    ] as const,
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

export function extractTodayQueueMeta(pages: TodayQueue[]) {
  const firstPage = pages[0];

  return {
    scheduled: firstPage?.scheduled ?? [],
    completedToday: firstPage?.completedToday ?? [],
  };
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
export function useSubordinates() {
  return useQuery({
    queryKey: activitiesKeys.subordinates(),
    queryFn: () => activitiesService.getSubordinates(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTodayQueueInfinite(limit = 30, assignedToId?: string) {
  return useInfiniteQuery({
    queryKey: activitiesKeys.todayQueueInfinite(limit, assignedToId),
    queryFn: ({ pageParam = 1 }) =>
      activitiesService.getTodayQueue(pageParam, limit, assignedToId),
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
    mutationFn: ({ taskId }: { taskId: string; installmentId?: string }) =>
      activitiesService.postponeTask(taskId),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: activitiesKeys.all }),
        queryClient.invalidateQueries({
          queryKey: quoteActivityPermissionsKeys.all,
        }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
        queryClient.invalidateQueries({ queryKey: installmentKeys.all }),
        variables.installmentId
          ? queryClient.invalidateQueries({
              queryKey: installmentKeys.detail(variables.installmentId),
            })
          : Promise.resolve(),
      ]);
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
      installmentId?: string;
    }) => activitiesService.rescheduleTask(taskId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: activitiesKeys.all }),
        queryClient.invalidateQueries({
          queryKey: quoteActivityPermissionsKeys.all,
        }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
        queryClient.invalidateQueries({ queryKey: installmentKeys.all }),
        variables.installmentId
          ? queryClient.invalidateQueries({
              queryKey: installmentKeys.detail(variables.installmentId),
            })
          : Promise.resolve(),
      ]);
    },
  });
}

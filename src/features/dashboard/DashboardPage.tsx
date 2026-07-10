import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AlertTriangle, Clock, RefreshCw, FileText } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/contexts/toast/toast-context";
import { useActionContext } from "@/contexts/action";
import { SummaryCard } from "@/features/dashboard/components/SummaryCards";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { ChargeTasksTab } from "@/features/dashboard/components/tasks/ChargeTasksTab";
import { TaskTab, writeTaskTabCookie } from "@/features/dashboard/constants/task-tab";
import { buildChargeActionPayload, getChargeRegisterPath } from "@/features/dashboard/utils/launch-action";
import { buildChargeQueueFromApiCards } from "@/features/dashboard/mappers/build-charge-queue-from-today";
import { mapQueueTaskCardToOverdueItem } from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import { isChargeQueueItemBlocked } from "@/features/dashboard/utils/charge-queue";
import { useInfiniteScroll } from "@/features/dashboard/hooks/useInfiniteScroll";
import {
  buildSegmentCountsFromApi,
  extractTodayQueueMeta,
  flattenTodayQueueCards,
  usePostponeTask,
  useRescheduleTask,
  useTodayQueueInfinite,
} from "@/hooks/useActivities";
import { useDashboard } from "@/hooks/useDashboard";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";
import { getTaskActionErrorMessage } from "@/lib/api/task-action-errors";
import { formatDate } from "@/lib/format/date";

interface ShellContext {
  onMobileLogout?: () => void;
}

export function DashboardPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { setActionData } = useActionContext();
  const { onMobileLogout } = useOutletContext<ShellContext>();

  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const {
    data: todayQueueData,
    isLoading: isLoadingTodayQueue,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTodayQueueInfinite(30);
  const postponeTask = usePostponeTask();
  const rescheduleTask = useRescheduleTask();

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const chargeQueueData = useMemo(() => {
    const pages = todayQueueData?.pages ?? [];
    const cards = flattenTodayQueueCards(pages);
    const queueView = buildChargeQueueFromApiCards(cards);
    const firstPage = pages[0];
    const { scheduled, completedToday } = extractTodayQueueMeta(pages);

    return {
      items: queueView.flat.map((entry) => entry.item),
      queueView,
      counter: firstPage?.counter ?? cards.length,
      segmentCounts: buildSegmentCountsFromApi(firstPage?.segments ?? []),
      scheduledItems: scheduled.map(mapQueueTaskCardToOverdueItem),
      completedTodayItems: completedToday.map(mapQueueTaskCardToOverdueItem),
    };
  }, [todayQueueData?.pages]);

  const {
    items: chargeItems,
    queueView: chargeQueueView,
    counter: chargeCounter,
    segmentCounts,
    scheduledItems,
    completedTodayItems,
  } = chargeQueueData;

  const totalActions = chargeCounter;

  const ativos = dashboardData?.activeContracts ?? 0;
  const vencemHoje = dashboardData?.dueTodayContracts ?? 0;
  const emAtraso = dashboardData?.overdueContracts ?? 0;
  const renovProx = dashboardData?.upcomingRenewals.total ?? 0;

  const handleDetailOpen = (item: OverdueCollectionItem) => {
    writeTaskTabCookie(TaskTab.Charge);
    const installment = item.installment.number;
    const installmentId = item.installment.id;
    navigate(
      `/contracts/${item.contract.id}?mode=${TaskTab.Charge}&installment=${installment}&installmentId=${installmentId}`,
      {
        state: { item, mode: TaskTab.Charge },
      },
    );
  };

  const handleChargeAction = (item: OverdueCollectionItem) => {
    if (isChargeQueueItemBlocked(chargeQueueView, item)) {
      showToast(
        "Complete a tarefa anterior na fila antes de registrar esta ação.",
        {
          variant: "destructive",
        },
      );
      return;
    }

    const payload = buildChargeActionPayload(item, () => {
      showToast("Ação registrada.");
    });
    if (!payload) {
      showToast("Nenhuma tarefa de cobrança pendente para esta parcela.", {
        variant: "destructive",
      });
      return;
    }
    setActionData(payload);
    navigate(getChargeRegisterPath());
  };

  const handleChargeOpen = (item: OverdueCollectionItem) => {
    if (isChargeQueueItemBlocked(chargeQueueView, item)) {
      showToast(
        "Complete a tarefa anterior na fila antes de abrir este contrato.",
        { variant: "destructive" },
      );
      return;
    }

    handleDetailOpen(item);
  };

  const handlePostpone = async (item: OverdueCollectionItem) => {
    const taskId = item.task?.id;
    if (!taskId) {
      showToast("Nenhuma tarefa de cobrança pendente para postergar.", {
        variant: "destructive",
      });
      return;
    }

    try {
      await postponeTask.mutateAsync({
        taskId,
        installmentId: item.installment.id,
      });
      showToast("Tarefa postergada para amanhã.");
    } catch (err) {
      showToast(
        getTaskActionErrorMessage(err, "Não foi possível postergar a tarefa."),
        { variant: "destructive" },
      );
    }
  };

  const handleRescheduleVisit = async (
    item: OverdueCollectionItem,
    date: string,
  ) => {
    const taskId = item.task?.id;
    if (!taskId) {
      showToast("Nenhuma tarefa de visita pendente para reagendar.", {
        variant: "destructive",
      });
      return;
    }

    try {
      await rescheduleTask.mutateAsync({
        taskId,
        payload: { date },
        installmentId: item.installment.id,
      });
      showToast(`Visita reagendada para ${formatDate(date)}.`);
    } catch (err) {
      showToast(
        getTaskActionErrorMessage(err, "Não foi possível reagendar a visita."),
        { variant: "destructive" },
      );
    }
  };

  if (isLoadingDashboard) {
    return <DashboardSkeleton onLogout={onMobileLogout} />;
  }

  return (
    <PageContainer>
      <PageHeader
        subtitle={`${totalActions} contrato${totalActions !== 1 ? "s" : ""} precisa${totalActions === 1 ? "" : "m"} de ação hoje`}
        onLogout={onMobileLogout}
      />

      <div className="-mt-4 px-5 md:-mt-5 md:px-8">
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          <SummaryCard
            icon={<FileText size={18} />}
            value={ativos}
            label="Contratos ativos"
            variant="navy"
          />
          <SummaryCard
            icon={<Clock size={18} />}
            value={vencemHoje}
            label="Vencem hoje"
            variant="amber"
          />
          <SummaryCard
            icon={<AlertTriangle size={18} />}
            value={emAtraso}
            label="Em atraso"
            variant="red"
          />
          <SummaryCard
            icon={<RefreshCw size={18} />}
            value={renovProx}
            label="Renovação próxima"
            variant="blue"
          />
        </div>
      </div>

      <div className="flex-1 pt-5">
        <div className="mb-4 px-5 md:px-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground md:text-lg">
                Ações de hoje
              </span>
              <span className="rounded-full bg-brand-navy px-2 py-0.5 text-xs font-semibold text-white">
                {totalActions}
              </span>
            </div>
            <span className="text-xs text-muted-foreground/80">
              Ordenado por urgência
            </span>
          </div>

          <ChargeTasksTab
            isLoading={isLoadingTodayQueue}
            items={chargeItems}
            queueView={chargeQueueView}
            segmentCounts={segmentCounts}
            scheduledItems={scheduledItems}
            completedTodayItems={completedTodayItems}
            onOpen={handleChargeOpen}
            onOpenDetail={handleDetailOpen}
            onAction={handleChargeAction}
            onPostpone={handlePostpone}
            onRescheduleVisit={handleRescheduleVisit}
            isPostponing={postponeTask.isPending}
            isRescheduling={rescheduleTask.isPending}
            hasNextPage={hasNextPage}
            loadMoreRef={loadMoreRef}
          />
        </div>
      </div>
    </PageContainer>
  );
}

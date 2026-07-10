import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AlertTriangle, Clock, RefreshCw, FileText } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/contexts/toast/toast-context";
import { useActionContext } from "@/contexts/action";
import { SummaryCard } from "@/features/dashboard/components/SummaryCards";
import { PerformanceSection } from "@/features/dashboard/components/PerformanceSection";
import { CommissionSection } from "@/features/dashboard/components/CommissionSection";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { TasksTabs } from "@/features/dashboard/components/tasks/TasksTabs";
import {
  readTaskTabFromCookie,
  TaskTab,
  writeTaskTabCookie,
} from "@/features/dashboard/constants/task-tab";
import type { PrevClient } from "@/features/dashboard/mocks/tasks";
import { mapPreventiveItemToPrevClient } from "@/features/dashboard/utils/task-mappers";
import {
  buildChargeActionPayload,
  buildPreventiveActionPayload,
  getChargeRegisterPath,
  getPreventiveRegisterPath,
} from "@/features/dashboard/utils/launch-action";
import { buildChargeQueueFromApiCards } from "@/features/dashboard/mappers/build-charge-queue-from-today";
import { isChargeQueueItemBlocked } from "@/features/dashboard/utils/charge-queue";
import { useInfiniteScroll } from "@/features/dashboard/hooks/useInfiniteScroll";
import {
  buildSegmentCountsFromApi,
  flattenTodayQueueCards,
  usePostponeTask,
  useRescheduleTask,
  useTodayQueueInfinite,
} from "@/hooks/useActivities";
import {
  useDashboard,
  usePerformance,
  usePreventiveContractsInfinite,
} from "@/hooks/useDashboard";
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
  const { data: performanceData, isLoading: isLoadingPerformance } =
    usePerformance();
  const {
    data: todayQueueData,
    isLoading: isLoadingTodayQueue,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTodayQueueInfinite(30);
  const postponeTask = usePostponeTask();
  const rescheduleTask = useRescheduleTask();

  const { data: preventiveData, isLoading: isLoadingPreventive } =
    usePreventiveContractsInfinite(30, 15);

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

    return {
      items: queueView.flat.map((entry) => entry.item),
      queueView,
      counter: firstPage?.counter ?? cards.length,
      segmentCounts: buildSegmentCountsFromApi(firstPage?.segments ?? []),
    };
  }, [todayQueueData?.pages]);

  const {
    items: chargeItems,
    queueView: chargeQueueView,
    counter: chargeCounter,
    segmentCounts,
  } = chargeQueueData;
  const preventiveItems =
    preventiveData?.pages.flatMap((page) => page.items) ?? [];
  const preventiveMapped = preventiveItems.map((item) =>
    mapPreventiveItemToPrevClient(item),
  );

  const preventivePending = preventiveMapped.filter(
    (c) => c.followupCount === 0,
  );
  const preventiveDoneList = preventiveMapped
    .filter((c) => c.followupCount > 0)
    .map((client) => ({
      client,
      label: "Contato registrado",
    }));

  const totalActions = chargeCounter + preventivePending.length;

  const ativos = dashboardData?.activeContracts ?? 0;
  const vencemHoje = dashboardData?.dueTodayContracts ?? 0;
  const emAtraso = dashboardData?.overdueContracts ?? 0;
  const renovProx = dashboardData?.upcomingRenewals.total ?? 0;

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

    writeTaskTabCookie(readTaskTabFromCookie());
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

  const handlePrevAction = (client: PrevClient) => {
    writeTaskTabCookie(readTaskTabFromCookie());
    setActionData(
      buildPreventiveActionPayload(client, () => {
        showToast("Contato preventivo registrado!");
      }),
    );
    navigate(getPreventiveRegisterPath());
  };

  const handleChargeOpen = (item: OverdueCollectionItem) => {
    if (isChargeQueueItemBlocked(chargeQueueView, item)) {
      showToast(
        "Complete a tarefa anterior na fila antes de abrir este contrato.",
        { variant: "destructive" },
      );
      return;
    }

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

  const handlePrevOpen = (client: PrevClient) => {
    writeTaskTabCookie(TaskTab.Preventive);
    const source = preventiveItems.find(
      (item) =>
        item.contract.id === client.id &&
        item.installment.number === client.installmentNumber,
    );
    const installment = source?.installment.number;
    const installmentParam = installment ? `&installment=${installment}` : "";
    navigate(
      `/contracts/${client.id}?mode=${TaskTab.Preventive}${installmentParam}`,
      {
        state: {
          item: source,
          mode: TaskTab.Preventive,
        },
      },
    );
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

      <PerformanceSection
        data={performanceData}
        isLoading={isLoadingPerformance}
      />
      <CommissionSection />

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

          <TasksTabs
            chargeCount={chargeCounter}
            preventiveCount={preventivePending.length}
            charge={{
              isLoading: isLoadingTodayQueue,
              items: chargeItems,
              queueView: chargeQueueView,
              segmentCounts,
              onOpen: handleChargeOpen,
              onAction: handleChargeAction,
              onPostpone: handlePostpone,
              onRescheduleVisit: handleRescheduleVisit,
              isPostponing: postponeTask.isPending,
              isRescheduling: rescheduleTask.isPending,
              hasNextPage,
              loadMoreRef,
            }}
            preventive={{
              isLoading: isLoadingPreventive,
              pending: preventivePending,
              done: preventiveDoneList,
              onOpen: handlePrevOpen,
              onAction: handlePrevAction,
            }}
          />
        </div>
      </div>
    </PageContainer>
  );
}

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { AlertTriangle, Clock, RefreshCw, FileText } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/contexts/toast/toast-context";
import { useActionContext } from "@/contexts/action";
import type { PreventiveContactType } from "@/contexts/action/action-context";
import { SummaryCard } from "@/features/dashboard/components/SummaryCards";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { ChargeTasksTab } from "@/features/dashboard/components/tasks/ChargeTasksTab";
import { QUEUE_HIGHLIGHT_ATTR } from "@/features/dashboard/components/task-cards/ChargeQueueCompactRow";
import {
  TaskTab,
  writeTaskTabCookie,
} from "@/features/dashboard/constants/task-tab";
import {
  resolveChargeActionPayload,
  getChargeRegisterPath,
} from "@/features/dashboard/utils/launch-action";
import { buildChargeQueueFromApiCards } from "@/features/dashboard/mappers/build-charge-queue-from-today";
import { mapQueueTaskCardToOverdueItem } from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import { isChargeQueueItemBlocked } from "@/features/dashboard/utils/charge-queue";
import type { QueueHighlightNavigationState } from "@/features/dashboard/utils/queue-highlight-navigation";
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
import { getApiErrorMessage } from "@/lib/api/errors";
import { getTaskActionErrorMessage } from "@/lib/api/task-action-errors";
import { formatDate } from "@/lib/format/date";
import { useDragScroll } from "@/hooks/useDragScroll";

const QUEUE_HIGHLIGHT_MS = 5000;

function scrollToHighlightedCard(installmentId: string): boolean {
  const el = document.querySelector(
    `[${QUEUE_HIGHLIGHT_ATTR}="${CSS.escape(installmentId)}"]`,
  );
  if (!(el instanceof HTMLElement)) return false;

  const rect = el.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const targetY = absoluteTop - window.innerHeight / 2 + rect.height / 2;
  window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  return true;
}

interface ShellContext {
  onMobileLogout?: () => void;
}

export function DashboardPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
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
  const summaryScrollRef = useRef<HTMLDivElement>(null);
  const summaryScroll = useDragScroll(summaryScrollRef);
  const [highlightedInstallmentId, setHighlightedInstallmentId] = useState<
    string | null
  >(null);
  const [pinnedHighlightItem, setPinnedHighlightItem] =
    useState<OverdueCollectionItem | null>(null);
  const [consumedNavHighlightId, setConsumedNavHighlightId] = useState<
    string | null
  >(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const highlightScrolledRef = useRef<string | null>(null);

  const navCompletedHighlightId =
    (location.state as QueueHighlightNavigationState | null)
      ?.highlightCompletedInstallmentId ?? null;

  // Ajusta state durante o render quando a navegação traz um highlight (evita setState no effect).
  if (
    navCompletedHighlightId &&
    navCompletedHighlightId !== consumedNavHighlightId
  ) {
    setConsumedNavHighlightId(navCompletedHighlightId);
    setPinnedHighlightItem(null);
    setHighlightedInstallmentId(navCompletedHighlightId);
  }

  const clearHighlightTimeout = useCallback(() => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  const clearPinnedHighlight = useCallback(() => {
    clearHighlightTimeout();
    setHighlightedInstallmentId(null);
    setPinnedHighlightItem(null);
    highlightScrolledRef.current = null;
  }, [clearHighlightTimeout]);

  const startHighlightTimer = useCallback(() => {
    clearHighlightTimeout();
    highlightTimeoutRef.current = setTimeout(() => {
      clearPinnedHighlight();
    }, QUEUE_HIGHLIGHT_MS);
  }, [clearHighlightTimeout, clearPinnedHighlight]);

  useEffect(() => {
    return () => {
      clearHighlightTimeout();
    };
  }, [clearHighlightTimeout]);

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

  useEffect(() => {
    if (!navCompletedHighlightId) return;

    highlightScrolledRef.current = null;
    clearHighlightTimeout();
    startHighlightTimer();
    navigate(".", { replace: true, state: null });
  }, [
    navCompletedHighlightId,
    navigate,
    clearHighlightTimeout,
    startHighlightTimer,
  ]);

  useEffect(() => {
    if (!highlightedInstallmentId) {
      highlightScrolledRef.current = null;
      return;
    }
    if (highlightScrolledRef.current === highlightedInstallmentId) return;

    let cancelled = false;
    let rafOuter = 0;
    let rafInner = 0;

    rafOuter = window.requestAnimationFrame(() => {
      rafInner = window.requestAnimationFrame(() => {
        if (cancelled) return;
        if (scrollToHighlightedCard(highlightedInstallmentId)) {
          highlightScrolledRef.current = highlightedInstallmentId;
          if (pinnedHighlightItem) {
            startHighlightTimer();
          }
        }
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafOuter);
      window.cancelAnimationFrame(rafInner);
    };
  }, [
    highlightedInstallmentId,
    pinnedHighlightItem,
    completedTodayItems,
    isLoadingTodayQueue,
    startHighlightTimer,
  ]);

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

  const launchChargeAction = async (
    item: OverdueCollectionItem,
    contactType?: PreventiveContactType,
  ) => {
    if (isChargeQueueItemBlocked(chargeQueueView, item)) {
      showToast(
        "Complete a tarefa anterior na fila antes de registrar esta ação.",
        {
          variant: "destructive",
        },
      );
      return;
    }

    try {
      const payload = await resolveChargeActionPayload(
        item,
        () => {
          showToast("Ação registrada.");
        },
        { contactType },
      );
      if (!payload) {
        showToast("Nenhuma tarefa de cobrança pendente para esta parcela.", {
          variant: "destructive",
        });
        return;
      }
      setActionData(payload);
      navigate(getChargeRegisterPath());
    } catch (err) {
      showToast(
        getApiErrorMessage(
          err,
          "Não foi possível carregar os dados da parcela.",
        ),
        { variant: "destructive" },
      );
    }
  };

  const handleChargeWhatsApp = (item: OverdueCollectionItem) => {
    launchChargeAction(item, "whatsapp");
  };

  const handleChargeCall = (item: OverdueCollectionItem) => {
    launchChargeAction(item, "phone");
  };

  const handleChargeVisit = (item: OverdueCollectionItem) => {
    launchChargeAction(item, "visit");
  };

  const handleChargeAction = (item: OverdueCollectionItem) => {
    launchChargeAction(item);
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

      clearHighlightTimeout();
      highlightScrolledRef.current = null;
      const pinnedItem: OverdueCollectionItem = {
        ...item,
        wasPostponed: true,
      };
      setPinnedHighlightItem(pinnedItem);
      setHighlightedInstallmentId(item.installment.id);
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

      clearHighlightTimeout();
      highlightScrolledRef.current = null;
      const pinnedItem: OverdueCollectionItem = {
        ...item,
        wasRescheduled: true,
        expireDate: date,
      };
      setPinnedHighlightItem(pinnedItem);
      setHighlightedInstallmentId(item.installment.id);
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
        subtitle={`${emAtraso} contrato${emAtraso !== 1 ? "s" : ""} precisa${emAtraso === 1 ? "" : "m"} de ação hoje`}
        onLogout={onMobileLogout}
      />

      <div className="-mt-4 md:-mt-5 md:px-8">
        <div className="relative">
          <div
            ref={summaryScrollRef}
            onPointerDown={summaryScroll.onPointerDown}
            onPointerMove={summaryScroll.onPointerMove}
            onPointerUp={summaryScroll.onPointerUp}
            onPointerCancel={summaryScroll.onPointerCancel}
            className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 pb-1 select-none active:cursor-grabbing md:grid md:cursor-auto md:snap-none md:grid-cols-4 md:overflow-visible md:scroll-pl-0 md:pb-0 [&>*:first-child]:ml-5 md:[&>*:first-child]:ml-0 [&>*:last-child]:mr-5 md:[&>*:last-child]:mr-0"
          >
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
      </div>

      <div className="px-5 pt-5 pb-4 md:px-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#1A1D2E] md:text-lg">
              Ações de hoje
            </span>
            <span className="rounded-full bg-brand-navy px-2 py-0.5 text-xs font-semibold text-white">
              {totalActions}
            </span>
          </div>
          <span className="text-xs text-[#9DA3B4]">Ordenado por urgência</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 md:px-8">
        <ChargeTasksTab
          isLoading={isLoadingTodayQueue}
          items={chargeItems}
          queueView={chargeQueueView}
          segmentCounts={segmentCounts}
          scheduledItems={scheduledItems}
          completedTodayItems={completedTodayItems}
          queueTotal={totalActions}
          onOpen={handleChargeOpen}
          onOpenDetail={handleDetailOpen}
          onAction={handleChargeAction}
          onWhatsApp={handleChargeWhatsApp}
          onCall={handleChargeCall}
          onVisit={handleChargeVisit}
          onPostpone={handlePostpone}
          onRescheduleVisit={handleRescheduleVisit}
          isPostponing={postponeTask.isPending}
          isRescheduling={rescheduleTask.isPending}
          highlightedInstallmentId={highlightedInstallmentId}
          pinnedHighlightItem={pinnedHighlightItem}
          hasNextPage={Boolean(hasNextPage)}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => {
            void fetchNextPage();
          }}
        />
      </div>
    </PageContainer>
  );
}

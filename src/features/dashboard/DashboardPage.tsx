import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { AlertTriangle, Clock, RefreshCw, FileText } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/contexts/toast/toast-context";
import { useActionContext } from "@/contexts/action";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
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
  useSubordinates,
  useTodayQueueInfinite,
} from "@/hooks/useActivities";
import { useTaskInteractionPermission } from "@/hooks/useTaskInteractionPermission";
import { useDashboard } from "@/hooks/useDashboard";
import { useQuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getTaskActionErrorMessage } from "@/lib/api/task-action-errors";
import { formatDate } from "@/lib/format/date";
import { useDragScroll } from "@/hooks/useDragScroll";
import { QuoteActivityPermissionsAlert } from "@/features/dashboard/components/QuoteActivityPermissionsAlert";
import { buildContractListPath } from "@/features/carteira/utils/contract-list-route";

const QUEUE_HIGHLIGHT_MS = 5000;
const MY_ACTIVITIES_VALUE = "my-activities";

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
  const canInteractWithTask = useTaskInteractionPermission();
  const { onMobileLogout } = useOutletContext<ShellContext>();

  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const { data: quoteActivityPermissions } = useQuoteActivityPermissions();
  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState(MY_ACTIVITIES_VALUE);
  const selectedAssignedToId =
    selectedAssigneeId === MY_ACTIVITIES_VALUE ? undefined : selectedAssigneeId;
  const { data: subordinates = [] } = useSubordinates();
  const assigneeOptions = useMemo(
    () => [
      { value: MY_ACTIVITIES_VALUE, label: "Minhas atividades" },
      ...subordinates.map((subordinate) => ({
        value: subordinate.id,
        label: subordinate.name,
      })),
    ],
    [subordinates],
  );
  const {
    data: todayQueueData,
    isLoading: isLoadingTodayQueue,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTodayQueueInfinite(30, selectedAssignedToId);
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
  const rescheduleHighlightTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleAssigneeChange = (value: string) => {
    setSelectedAssigneeId(value);
    setHighlightedInstallmentId(null);
    setPinnedHighlightItem(null);
    highlightScrolledRef.current = null;
  };

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
      if (rescheduleHighlightTimeoutRef.current) {
        clearTimeout(rescheduleHighlightTimeoutRef.current);
        rescheduleHighlightTimeoutRef.current = null;
      }
    };
  }, [clearHighlightTimeout]);

  const chargeQueueData = useMemo(() => {
    const pages = todayQueueData?.pages ?? [];
    const cards = flattenTodayQueueCards(pages);
    const queueView = buildChargeQueueFromApiCards(cards, canInteractWithTask);
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
  }, [todayQueueData?.pages, canInteractWithTask]);

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
    const installmentId = item.installment.id;
    navigate(`/activities/installments/${installmentId}`, {
      state: { item },
    });
  };

  const launchChargeAction = async (
    item: OverdueCollectionItem,
    contactType?: PreventiveContactType,
  ) => {
    if (isChargeQueueItemBlocked(chargeQueueView, item)) {
      showToast(
        "Esta tarefa está bloqueada. Complete as tarefas do segmento atual (mais prioritário) para liberá-la.",
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
  ): Promise<boolean> => {
    const taskId = item.task?.id;
    if (!taskId) {
      showToast("Nenhuma tarefa de visita pendente para reagendar.", {
        variant: "destructive",
      });
      return false;
    }

    try {
      const rescheduledTask = await rescheduleTask.mutateAsync({
        taskId,
        payload: { date },
        installmentId: item.installment.id,
      });
      showToast(`Visita reagendada para ${formatDate(date)}.`);

      // Adia o highlight até o dialog fechar e liberar o scroll lock do Radix.
      if (rescheduleHighlightTimeoutRef.current) {
        clearTimeout(rescheduleHighlightTimeoutRef.current);
      }
      rescheduleHighlightTimeoutRef.current = setTimeout(() => {
        rescheduleHighlightTimeoutRef.current = null;
        clearHighlightTimeout();
        highlightScrolledRef.current = null;
        const pinnedItem: OverdueCollectionItem = {
          ...item,
          wasRescheduled: true,
          rescheduleCount: rescheduledTask.rescheduleCount,
          expireDate: date,
        };
        setPinnedHighlightItem(pinnedItem);
        setHighlightedInstallmentId(item.installment.id);
      }, 250);
      return true;
    } catch (err) {
      showToast(
        getTaskActionErrorMessage(err, "Não foi possível reagendar a visita."),
        { variant: "destructive" },
      );
      return false;
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
              onClick={() =>
                navigate(
                  buildContractListPath("Contratos ativos", {
                    onlyActive: true,
                  }),
                )
              }
            />
            <SummaryCard
              icon={<Clock size={18} />}
              value={vencemHoje}
              label="Vencem hoje"
              variant="amber"
              onClick={() =>
                navigate(
                  buildContractListPath("Contratos que vencem hoje", {
                    onlyDueToday: true,
                  }),
                )
              }
            />
            <SummaryCard
              icon={<AlertTriangle size={18} />}
              value={emAtraso}
              label="Em atraso"
              variant="red"
              onClick={() =>
                navigate(
                  buildContractListPath("Contratos em atraso", {
                    onlyDelinquency: true,
                  }),
                )
              }
            />
            <SummaryCard
              icon={<RefreshCw size={18} />}
              value={renovProx}
              label="Renovação próxima"
              variant="blue"
              onClick={() =>
                navigate(
                  buildContractListPath("Contratos com renovação próxima", {
                    onlyUpcomingRenewal: true,
                  }),
                )
              }
            />
          </div>
        </div>
      </div>

      {quoteActivityPermissions && (
        <div className="px-5 pt-5 md:px-8">
          <QuoteActivityPermissionsAlert {...quoteActivityPermissions} />
        </div>
      )}

      <div className="mx-5 mt-7 border-t border-border pt-5 pb-4 md:mx-8">
        <div className="mb-3">
          {subordinates.length > 0 ? (
            <div className="flex items-center gap-2 md:w-90">
              <SelectDialogField
                value={selectedAssigneeId}
                onChange={handleAssigneeChange}
                options={assigneeOptions}
                placeholder="Minhas atividades"
                dialogTitle="Filtrar atividades"
                className="min-w-0 flex-1"
                selectedLabelClassName="text-base font-semibold"
              />
              <span
                aria-label={`${totalActions} atividades de hoje`}
                className="rounded-full bg-brand-navy px-2 py-0.5 text-xs font-semibold text-white"
              >
                {totalActions}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#1A1D2E] md:text-lg">
                Atividades de hoje
              </span>
              <span className="rounded-full bg-brand-navy px-2 py-0.5 text-xs font-semibold text-white">
                {totalActions}
              </span>
            </div>
          )}
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

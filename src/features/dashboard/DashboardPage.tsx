import { useState } from "react";
import { AlertTriangle, Clock, RefreshCw, FileText } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/contexts/toast/toast-context";
import { SummaryCard } from "@/features/dashboard/components/SummaryCards";
import { PerformanceSection } from "@/features/dashboard/components/PerformanceSection";
import { CommissionSection } from "@/features/dashboard/components/CommissionSection";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { TasksTabs } from "@/features/dashboard/components/tasks/TasksTabs";
import { type CobrStage } from "@/features/dashboard/mocks/tasks";
import { mapFollowupStatusToStage, mapPreventiveContractToPrevClient } from "@/features/dashboard/utils/task-mappers";
import { useInfiniteScroll } from "@/features/dashboard/hooks/useInfiniteScroll";
import {
  useDashboard,
  usePerformance,
  useOverdueContractsInfinite,
  usePreventiveContractsInfinite,
} from "@/hooks/useDashboard";
import type { OverdueContract } from "@/services/dashboard/dashboard.types";

interface ShellContext {
  onMobileLogout?: () => void;
}

export function DashboardPage() {
  const { showToast } = useToast();
  const { onMobileLogout } = useOutletContext<ShellContext>();
  const [prevDone, setPrevDone] = useState<
    Record<string, { at: number; status: string }>
  >({});
  const [cobrStages, setCobrStages] = useState<Record<string, CobrStage>>({});

  // Fetch real data from API
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const { data: performanceData, isLoading: isLoadingPerformance } =
    usePerformance();
  const {
    data: overdueData,
    isLoading: isLoadingOverdue,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOverdueContractsInfinite(30);

  const { data: preventiveData } = usePreventiveContractsInfinite(30, 15);

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  // Flatten all pages into a single array of contracts
  const overdueContracts =
    overdueData?.pages.flatMap((page) => page.contracts) ?? [];
  const preventiveContracts =
    preventiveData?.pages.flatMap((page) => page.contracts) ?? [];

  const getCobrStage = (contract: OverdueContract): CobrStage =>
    cobrStages[contract.contractId] ??
    mapFollowupStatusToStage(
      contract.firstOverdueInstallment.latestFollowupStatus,
    );

  // Preventive tasks from API
  const preventivePending = preventiveContracts
    .map((contract) => mapPreventiveContractToPrevClient(contract))
    .filter((c) => !prevDone[c.id]);
  const preventiveDoneList = preventiveContracts
    .map((contract) => mapPreventiveContractToPrevClient(contract))
    .filter((c) => prevDone[c.id])
    .map((client) => ({
      client,
      label: prevDone[client.id]?.status ?? "Concluído",
    }));

  // Collection tasks from API
  const cobrPending = overdueContracts.filter(
    (c) => getCobrStage(c) !== "paid",
  );

  const totalActions = cobrPending.length + preventivePending.length;

  // KPIs from API
  const ativos = dashboardData?.activeContracts ?? 0;
  const vencemHoje = dashboardData?.dueTodayContracts ?? 0;
  const emAtraso = dashboardData?.overdueContracts ?? 0;
  const renovProx = dashboardData?.upcomingRenewals.total ?? 0;

  const handleAction = (name: string) => {
    showToast(`Registro de ação para ${name} — em breve.`);
  };

  const handleCobrReopen = (contractId: string) => {
    setCobrStages((s) => ({ ...s, [contractId]: "initial" }));
    showToast("Tarefa reaberta.");
  };

  const handlePrevReopen = (id: string) => {
    setPrevDone((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
    showToast("Tarefa reaberta.");
  };

  // Show skeleton while loading dashboard data
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
            cobrCount={cobrPending.length}
            prevCount={preventivePending.length}
            cobr={{
              isLoading: isLoadingOverdue,
              contracts: overdueContracts,
              getStage: getCobrStage,
              onAction: handleAction,
              onReopen: handleCobrReopen,
              hasNextPage,
              loadMoreRef,
            }}
            prev={{
              pending: preventivePending,
              done: preventiveDoneList,
              onAction: handleAction,
              onReopen: handlePrevReopen,
            }}
          />
        </div>
      </div>
    </PageContainer>
  );
}

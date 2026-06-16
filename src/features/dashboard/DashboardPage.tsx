import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Clock, RefreshCw, FileText } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/contexts/toast/toast-context";
import { SummaryCard } from "@/features/dashboard/components/SummaryCards";
import { PerformanceSection } from "@/features/dashboard/components/PerformanceSection";
import { CommissionSection } from "@/features/dashboard/components/CommissionSection";
import {
  CobrTaskCard,
  PrevTaskCard,
  DoneCard,
} from "@/features/dashboard/components/TaskCards";
import {
  prevClients,
  type CobrStage,
  type ActivityType,
} from "@/features/dashboard/mocks/tasks";
import { useDashboard, usePerformance, useOverdueContractsInfinite } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverdueContract } from "@/services/dashboard/dashboard.types";

interface ShellContext {
  onMobileLogout?: () => void;
}

export function DashboardPage() {
  const { showToast } = useToast();
  const { onMobileLogout } = useOutletContext<ShellContext>();
  const [taskTab, setTaskTab] = useState<"cobr" | "prev">("cobr");
  const [prevDone, setPrevDone] = useState<
    Record<string, { at: number; status: string }>
  >({});
  const [cobrStages, setCobrStages] = useState<Record<string, CobrStage>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch real data from API
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  const { data: performanceData, isLoading: isLoadingPerformance } = usePerformance();
  const {
    data: overdueData,
    isLoading: isLoadingOverdue,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOverdueContractsInfinite(30);

  // Flatten all pages into a single array of contracts
  const overdueContracts = overdueData?.pages.flatMap((page) => page.contracts) ?? [];

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loadMoreRef.current && hasNextPage && !isFetchingNextPage) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getCobrStage = (id: string, defaultStage: CobrStage) =>
    cobrStages[id] ?? defaultStage;

  // Preventive tasks (still using mock data - no backend endpoint)
  const prevPending = prevClients.filter((c) => !prevDone[c.id]);

  // Collection tasks from API
  const cobrPending = overdueContracts.filter(
    (c) => getCobrStage(c.contractId, mapFollowupStatusToStage(c.firstOverdueInstallment.latestFollowupStatus)) !== "paid",
  );

  const totalActions = cobrPending.length + prevPending.length;

  // KPIs from API
  const ativos = dashboardData?.activeContracts ?? 0;
  const vencemHoje = dashboardData?.dueTodayContracts ?? 0;
  const emAtraso = dashboardData?.overdueContracts ?? 0;
  const renovProx = dashboardData?.upcomingRenewals.total ?? 0;

  const handleAction = (name: string) => {
    showToast(`Registro de ação para ${name} — em breve.`);
  };

  // Show skeleton while loading dashboard data
  if (isLoadingDashboard) {
    return (
      <PageContainer>
        <PageHeader
          subtitle="Carregando..."
          onLogout={onMobileLogout}
        />
        <div className="-mt-4 px-5 md:-mt-5 md:px-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
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

      <PerformanceSection data={performanceData} isLoading={isLoadingPerformance} />
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

          <Tabs
            value={taskTab}
            onValueChange={(v) => setTaskTab(v as "cobr" | "prev")}
            className="w-full"
          >
            <TabsList className="md:w-72">
              <TabsTrigger value="cobr">
                Cobrança
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    taskTab === "cobr"
                      ? "bg-brand-navy text-white"
                      : "bg-[#D8D9E0] text-muted-foreground/80"
                  }`}
                >
                  {cobrPending.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="prev">
                Preventivo
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    taskTab === "prev"
                      ? "bg-brand-navy text-white"
                      : "bg-[#D8D9E0] text-muted-foreground/80"
                  }`}
                >
                  {prevPending.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cobr" className="w-full">
              {isLoadingOverdue ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <Skeleton className="h-40 rounded-2xl" />
                  <Skeleton className="h-40 rounded-2xl" />
                  <Skeleton className="h-40 rounded-2xl" />
                  <Skeleton className="h-40 rounded-2xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cobrPending.map((c) => {
                    const client = mapOverdueContractToCobrClient(c);
                    const stage = getCobrStage(c.contractId, mapFollowupStatusToStage(c.firstOverdueInstallment.latestFollowupStatus));
                    return (
                      <CobrTaskCard
                        key={c.contractId}
                        client={client}
                        stage={stage}
                        onAction={() => handleAction(c.clientName)}
                      />
                    );
                  })}
                  {overdueContracts
                    .filter((c) => getCobrStage(c.contractId, mapFollowupStatusToStage(c.firstOverdueInstallment.latestFollowupStatus)) === "paid")
                    .map((c) => (
                      <DoneCard
                        key={c.contractId}
                        name={c.clientName}
                        contract={c.contractNumber}
                        label="Pagamento confirmado"
                        onReopen={() => {
                          setCobrStages((s) => ({ ...s, [c.contractId]: "initial" }));
                          showToast("Tarefa reaberta.");
                        }}
                      />
                    ))}
                  {hasNextPage && (
                    <>
                      <div ref={loadMoreRef} className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                      </div>
                    </>
                  )}
                  {cobrPending.length === 0 && !hasNextPage && (
                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                      <EmptyState label="Nenhuma cobrança pendente hoje." />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prev" className="w-full">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {prevPending.map((c) => (
                  <PrevTaskCard
                    key={c.id}
                    client={c}
                    onAction={() => handleAction(c.name)}
                  />
                ))}
                {prevClients
                  .filter((c) => prevDone[c.id])
                  .map((c) => (
                    <DoneCard
                      key={c.id}
                      name={c.name}
                      contract={c.contract}
                      label={prevDone[c.id]?.status ?? "Concluído"}
                      onReopen={() => {
                        setPrevDone((d) => {
                          const next = { ...d };
                          delete next[c.id];
                          return next;
                        });
                        showToast("Tarefa reaberta.");
                      }}
                    />
                  ))}
                {prevPending.length === 0 && (
                  <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                    <EmptyState label="Nenhuma tarefa preventiva pendente hoje." />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}

/**
 * Maps backend's latestFollowupStatus to frontend's CobrStage
 * This is a simplified mapping since the backend only returns the latest status as a string
 */
function mapFollowupStatusToStage(status: string | undefined): CobrStage {
  if (!status) return "initial";
  
  const statusLower = status.toLowerCase();
  
  // Simple mapping - can be refined based on actual backend statuses
  if (statusLower.includes("promise") || statusLower.includes("promessa")) {
    return "promise";
  }
  if (statusLower.includes("paid") || statusLower.includes("pago")) {
    return "paid";
  }
  if (statusLower.includes("fup") || statusLower.includes("followup")) {
    return "fup";
  }
  if (statusLower.includes("no_return") || statusLower.includes("sem retorno")) {
    return "no_return_1";
  }
  
  return "initial";
}

/**
 * Maps backend OverdueContract to frontend CobrClient
 */
function mapOverdueContractToCobrClient(contract: OverdueContract) {
  const installment = contract.firstOverdueInstallment;
  const activityType: ActivityType = installment.daysOverdue > 30 ? "visit" : "phone"; // Business rule as per plan
  
  return {
    id: contract.contractId,
    name: contract.clientName,
    contract: contract.contractNumber,
    parcela: `Parc ${installment.installmentNumber}/${contract.totalInstallments}`,
    value: installment.pendingAmount,
    overdueDays: installment.daysOverdue,
    phone: "", // Not provided by backend - will need to be fetched separately or left empty
    activityType,
    stage: mapFollowupStatusToStage(installment.latestFollowupStatus),
    lastAction: installment.latestFollowupStatus ? `${installment.followupCount} follow-up(s) · ${installment.latestFollowupStatus}` : null,
  };
}

import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
} from "lucide-react";
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
  cobrClients,
  type CobrStage,
} from "@/features/dashboard/mocks/tasks";

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

  const getCobrStage = (id: string, defaultStage: CobrStage) =>
    cobrStages[id] ?? defaultStage;

  const prevPending = prevClients.filter((c) => !prevDone[c.id]);
  const cobrPending = cobrClients.filter(
    (c) => getCobrStage(c.id, c.stage) !== "paid",
  );
  const totalActions = cobrPending.length + prevPending.length;
  const vencemHoje = prevClients.filter(
    (c) => c.daysUntilDue === 0 && !prevDone[c.id],
  ).length;
  const emAtraso = cobrPending.length;
  const renovProx = prevClients.filter(
    (c) => c.daysUntilDue === 2 && !prevDone[c.id],
  ).length;
  const ativos = prevClients.length + cobrClients.length;

  const handleAction = (name: string) => {
    showToast(`Registro de ação para ${name} — em breve.`);
  };

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

      <PerformanceSection />
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cobrPending.map((c) => (
                  <CobrTaskCard
                    key={c.id}
                    client={c}
                    stage={getCobrStage(c.id, c.stage)}
                    onAction={() => handleAction(c.name)}
                  />
                ))}
                {cobrClients
                  .filter((c) => getCobrStage(c.id, c.stage) === "paid")
                  .map((c) => (
                    <DoneCard
                      key={c.id}
                      name={c.name}
                      contract={c.contract}
                      label="Pagamento confirmado"
                      onReopen={() => {
                        setCobrStages((s) => ({ ...s, [c.id]: "initial" }));
                        showToast("Tarefa reaberta.");
                      }}
                    />
                  ))}
                {cobrPending.length === 0 && (
                  <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                    <EmptyState label="Nenhuma cobrança pendente hoje." />
                  </div>
                )}
              </div>
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

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { UseQueryResult } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { useAuth } from "@/contexts/auth/auth-context";
import { PerformanceDataSkeleton } from "@/features/performance/components/PerformanceSkeleton";
import { PerformanceMonthSelector } from "@/features/performance/components/PerformanceMonthSelector";
import { PerformanceError } from "@/features/performance/components/PerformanceError";
import { RealPerformanceSection } from "@/features/performance/components/RealPerformanceSection";
import {
  usePerformanceMonths,
  usePerformanceData,
  usePerformancePartners,
  usePerformanceTeam,
} from "@/hooks/usePerformanceData";
import { formatMonth } from "@/features/performance/utils/format";
import type { PerformanceResponse } from "@/services/performance/performance.types";

function PerformanceContent({
  month,
  currentMonth,
  query,
}: {
  month: string;
  currentMonth: string;
  query: UseQueryResult<PerformanceResponse, Error>;
}) {
  if (query.isError)
    return (
      <PerformanceError
        onRetry={() => {
          void query.refetch();
        }}
        retrying={query.isFetching}
      />
    );
  if (query.isPending || !query.data) return <PerformanceDataSkeleton />;
  const response = query.data;
  if (response.month !== month)
    return (
      <PerformanceError
        onRetry={() => {
          void query.refetch();
        }}
        retrying={query.isFetching}
      />
    );
  if (response.availability === "NO_DATA")
    return (
      <div
        role="status"
        className="rounded-2xl border border-[#D6D9E3] bg-white p-5"
      >
        <p className="text-sm font-semibold text-brand-navy">
          Dados ainda não disponíveis para esta competência
        </p>
        <p className="mt-2 text-sm text-[#6B7080]">
          Ainda não há dados de {formatMonth(month)} para consulta. Você pode
          selecionar outra competência disponível no histórico.
        </p>
      </div>
    );
  return (
    <RealPerformanceSection
      month={month}
      currentMonth={currentMonth}
      data={response.data}
      view={response.view}
    />
  );
}

export function PerformancePage() {
  const { onMobileLogout } = useOutletContext<{
    onMobileLogout?: () => void;
  }>();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>();
  const monthsQuery = usePerformanceMonths();
  const month = selectedMonth ?? monthsQuery.data?.currentMonth;
  const partnersQuery = usePerformancePartners(month);
  const partners = partnersQuery.data ?? [];
  const partner =
    partners.find((person) => person.id === selectedPartnerId) ??
    partners.find((person) => person.id === user?.id) ??
    (partners.length === 1 ? partners[0] : undefined);
  const teamQuery = usePerformanceTeam(partner?.id, month);
  const team = teamQuery.data ?? [];
  const member = team.find((person) => person.id === selectedMemberId);
  const performanceQuery = usePerformanceData(
    month,
    partner?.id,
    member?.id,
    Boolean(partner && (!selectedMemberId || teamQuery.isSuccess)),
  );
  const response = performanceQuery.isSuccess
    ? performanceQuery.data
    : undefined;
  const level =
    response?.availability === "AVAILABLE" &&
    response.month === month &&
    !member
      ? response.data.level
      : undefined;
  const showPartners =
    partners.length > 1 || (partners.length === 1 && partner?.id !== user?.id);
  const showTeam = team.some((person) => person.id !== partner?.id);
  const selectionError = monthsQuery.isError
    ? monthsQuery
    : partnersQuery.isError
      ? partnersQuery
      : teamQuery.isError
        ? teamQuery
        : undefined;
  const loading =
    monthsQuery.isPending ||
    (Boolean(month) && partnersQuery.isPending) ||
    (Boolean(partner) && teamQuery.isPending);

  function changeMonth(value: string) {
    setSelectedMonth(value);
    setSelectedMemberId(undefined);
  }
  function changePartner(value: string) {
    setSelectedPartnerId(value);
    setSelectedMemberId(undefined);
  }

  return (
    <PageContainer>
      <PageHeader
        subtitle="Acompanhe suas metas e sua remuneração"
        onLogout={onMobileLogout}
      />
      <div className="flex flex-col gap-5 px-5 pt-6 md:gap-6 md:px-8">
        <PerformanceMonthSelector
          months={monthsQuery.data}
          value={month}
          onChange={changeMonth}
          level={level}
          partnerName={member?.name ?? partner?.name}
          peopleFilter={
            showPartners || showTeam ? (
              <>
                {showPartners && (
                  <SelectDialogField
                    label="Parceiro"
                    dialogTitle="Selecionar parceiro"
                    value={partner?.id ?? ""}
                    onChange={changePartner}
                    options={partners.map((person) => ({
                      value: person.id,
                      label: person.name,
                    }))}
                    placeholder="Selecione o parceiro"
                  />
                )}
                {showTeam && (
                  <SelectDialogField
                    label="Visualização"
                    dialogTitle="Selecionar visualização"
                    value={member?.id ?? "consolidated"}
                    onChange={(value) =>
                      setSelectedMemberId(
                        value === "consolidated" ? undefined : value,
                      )
                    }
                    options={[
                      { value: "consolidated", label: "Consolidado" },
                      ...team.map((person) => ({
                        value: person.id,
                        label:
                          person.id === partner?.id
                            ? `${person.name} — próprio`
                            : person.name,
                      })),
                    ]}
                  />
                )}
              </>
            ) : undefined
          }
        />
        {selectionError ? (
          <PerformanceError
            onRetry={() => {
              void selectionError.refetch();
            }}
            retrying={selectionError.isFetching}
          />
        ) : loading ? (
          <PerformanceDataSkeleton />
        ) : !partner ? (
          <div
            role="status"
            className="rounded-2xl border border-[#D6D9E3] bg-white p-5 text-sm text-[#6B7080]"
          >
            {partners.length > 0
              ? "Selecione um parceiro para acompanhar o desempenho."
              : "Dados ainda não disponíveis para esta competência"}
          </div>
        ) : month && monthsQuery.data ? (
          <PerformanceContent
            month={month}
            currentMonth={monthsQuery.data.currentMonth}
            query={performanceQuery}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { UseQueryResult } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { useSubordinates } from "@/hooks/useActivities";
import { PerformanceDataSkeleton } from "@/features/performance/components/PerformanceSkeleton";
import { PerformanceMonthSelector } from "@/features/performance/components/PerformanceMonthSelector";
import { PerformanceError } from "@/features/performance/components/PerformanceError";
import { RealPerformanceSection } from "@/features/performance/components/RealPerformanceSection";
import {
  usePerformanceMonths,
  usePerformanceData,
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
    />
  );
}

export function PerformancePage() {
  const { onMobileLogout } = useOutletContext<{
    onMobileLogout?: () => void;
  }>();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | undefined>();
  const { data: people = [] } = useSubordinates();
  const partnerName = people.find((person) => person.id === partnerId)?.name;
  const monthsQuery = usePerformanceMonths(partnerId);
  const month = selectedMonth ?? monthsQuery.data?.currentMonth;
  const performanceQuery = usePerformanceData(month, partnerId);
  const response = performanceQuery.isSuccess
    ? performanceQuery.data
    : undefined;
  const level =
    response?.availability === "AVAILABLE" && response.month === month
      ? response.data.level
      : undefined;

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
          onChange={setSelectedMonth}
          level={level}
          partnerName={partnerName}
          peopleFilter={
            people.length > 0 ? (
              <SelectDialogField
                label="Pessoa"
                dialogTitle="Filtrar desempenho"
                value={partnerId ?? "mine"}
                onChange={(value) =>
                  setPartnerId(value === "mine" ? undefined : value)
                }
                options={[
                  { value: "mine", label: "Meu desempenho" },
                  ...people.map((person) => ({
                    value: person.id,
                    label: person.name,
                  })),
                ]}
              />
            ) : undefined
          }
        />
        {monthsQuery.isPending ? (
          <PerformanceDataSkeleton />
        ) : monthsQuery.isError || !monthsQuery.data || !month ? (
          <PerformanceError
            onRetry={() => {
              void monthsQuery.refetch();
            }}
            retrying={monthsQuery.isFetching}
          />
        ) : (
          <PerformanceContent
            month={month}
            currentMonth={monthsQuery.data.currentMonth}
            query={performanceQuery}
          />
        )}
      </div>
    </PageContainer>
  );
}

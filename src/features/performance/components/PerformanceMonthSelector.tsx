import type { ReactNode } from "react";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import type {
  PerformanceLevel,
  PerformanceMonthsResponse,
} from "@/services/performance/performance.types";
import { PartnerIdentityBar } from "@/features/performance/components/PartnerIdentityBar";
import { buildMonthOptions } from "@/features/performance/utils/build-month-options";
import { getPeriodLabel } from "@/features/performance/utils/format";

interface PerformanceMonthSelectorProps {
  months?: PerformanceMonthsResponse;
  value?: string;
  onChange: (month: string) => void;
  level?: PerformanceLevel;
  partnerName?: string;
  peopleFilter?: ReactNode;
}

export function PerformanceMonthSelector({
  months,
  value,
  onChange,
  level,
  partnerName,
  peopleFilter,
}: PerformanceMonthSelectorProps) {
  return (
    <div className="flex flex-col gap-5">
      <div
        className={
          peopleFilter
            ? "flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6"
            : "flex min-w-0 justify-end"
        }
      >
        {peopleFilter && (
          <div className="grid min-w-0 gap-3 sm:grid-flow-col sm:auto-cols-fr md:flex-1 lg:max-w-[34rem]">
            {peopleFilter}
          </div>
        )}
        <div className="w-full min-w-0 sm:w-48 md:ml-auto md:shrink-0">
          <SelectDialogField
            name="performance-month"
            label="Competência"
            dialogTitle="Selecionar competência"
            value={value ?? ""}
            disabled={!months}
            onChange={onChange}
            options={months ? buildMonthOptions(months, value) : []}
            placeholder="Carregando competências…"
          />
          {months && value && (
            <p className="mt-1.5 flex items-center gap-2 text-[11px] text-[#697183]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#8991A2]"
              />
              <span>{getPeriodLabel(value, months.currentMonth)}</span>
            </p>
          )}
        </div>
      </div>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
          Desempenho
        </h2>
        <PartnerIdentityBar level={level} partnerName={partnerName} />
      </div>
    </div>
  );
}

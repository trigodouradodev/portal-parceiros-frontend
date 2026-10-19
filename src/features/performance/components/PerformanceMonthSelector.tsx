import type {
  PerformanceLevel,
  PerformanceMonthsResponse,
} from "@/services/performance/performance.types";
import { PartnerIdentityBar } from "@/features/performance/components/PartnerIdentityBar";
import { buildMonthOptions } from "@/features/performance/utils/build-month-options";
import { getPeriodLabel } from "@/features/performance/utils/format";

interface PerformanceMonthSelectorProps {
  months: PerformanceMonthsResponse;
  value: string;
  onChange: (month: string) => void;
  level?: PerformanceLevel;
}

export function PerformanceMonthSelector({
  months,
  value,
  onChange,
  level,
}: PerformanceMonthSelectorProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
          Desempenho
        </h2>
        <PartnerIdentityBar level={level} />
      </div>
      <div className="w-full sm:w-48 sm:shrink-0">
        <label
          htmlFor="performance-month"
          className="mb-1 block text-[11px] font-semibold text-[#697183]"
        >
          Competência
        </label>
        <select
          id="performance-month"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-[#D4D9E3] bg-white px-3 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
        >
          {buildMonthOptions(months).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 flex items-center gap-2 text-[11px] text-[#697183] sm:justify-end">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#8991A2]"
          />
          <span>{getPeriodLabel(value, months.currentMonth)}</span>
        </p>
      </div>
    </div>
  );
}

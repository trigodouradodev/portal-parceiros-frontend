import type { PerformanceMonthsResponse } from "@/services/performance/performance.types";
import { formatMonth } from "./format";

export function buildMonthOptions({
  currentMonth,
  months,
}: PerformanceMonthsResponse) {
  const options = months.map(({ month }) => ({
    value: month,
    label: formatMonth(month).replace(" de ", " - "),
  }));
  if (!months.some(({ month }) => month === currentMonth)) {
    options.push({
      value: currentMonth,
      label: formatMonth(currentMonth).replace(" de ", " - "),
    });
  }
  return options.sort((a, b) => b.value.localeCompare(a.value));
}

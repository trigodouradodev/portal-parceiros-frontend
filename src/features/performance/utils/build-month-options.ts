import type { PerformanceMonthsResponse } from "@/services/performance/performance.types";
import { formatMonth } from "./format";

function formatMonthLabel(month: string): string {
  const label = formatMonth(month).replace(" de ", " - ");
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

export function buildMonthOptions(
  { currentMonth, months }: PerformanceMonthsResponse,
  selectedMonth?: string,
) {
  const options = months.map(({ month }) => ({
    value: month,
    label: formatMonthLabel(month),
  }));
  if (!months.some(({ month }) => month === currentMonth)) {
    options.push({
      value: currentMonth,
      label: formatMonthLabel(currentMonth),
    });
  }
  if (selectedMonth && !options.some(({ value }) => value === selectedMonth)) {
    options.push({
      value: selectedMonth,
      label: formatMonthLabel(selectedMonth),
    });
  }
  return options.sort((a, b) => b.value.localeCompare(a.value));
}

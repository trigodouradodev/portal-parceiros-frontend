import { fmtBRL } from "@/lib/utils";

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return fmtBRL(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

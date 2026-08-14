import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { fmtBRL } from "@/lib/format/money";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parcela PRICE (PMT): `i = taxaPct/100`. Sem taxa, divide o principal. */
export function calcParcela(pv: number, n: number, taxaPct: number) {
  const i = taxaPct / 100;
  if (pv <= 0 || n <= 0) return 0;
  return i > 0 ? (pv * i) / (1 - Math.pow(1 + i, -n)) : pv / n;
}

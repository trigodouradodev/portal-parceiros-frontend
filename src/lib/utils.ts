import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { fmtBRL } from "@/lib/format/money";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** PRICE installment (PMT): `i = ratePct/100`. With no rate, splits the principal. */
export function calcInstallment(pv: number, n: number, ratePct: number) {
  const i = ratePct / 100;
  if (pv <= 0 || n <= 0) return 0;
  return i > 0 ? (pv * i) / (1 - Math.pow(1 + i, -n)) : pv / n;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtBRL = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

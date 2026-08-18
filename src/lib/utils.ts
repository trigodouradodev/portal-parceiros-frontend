import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { fmtBRL } from "@/lib/format/money";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

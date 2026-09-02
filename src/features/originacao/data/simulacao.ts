import type { ProductOption } from "@/services/products/products.types";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { SimulationStatus } from "@/services/origination/origination.types";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import { calcInstallment } from "@/lib/utils";

export const ALLOWED_DUE_DAYS = [5, 10, 15, 20];

/** D+45: first installment due date cannot exceed this window from today. */
export const FIRST_INSTALLMENT_MAX_DAYS = 45;

export const AMOUNT_MIN = 500;
export const AMOUNT_MAX = 30_000;
export const AMOUNT_STEP = 100;
export const AMOUNT_DEFAULT = 5_000;

const DEFAULT_MIN_INSTALLMENTS = 2;
const DEFAULT_MAX_INSTALLMENTS = 12;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isAllowedDueDate(date: Date): boolean {
  return ALLOWED_DUE_DAYS.includes(date.getDate());
}

/** Inclusive window: today .. today + maxDays, compared as local calendar dates. */
export function isDueDateInWindow(
  date: Date,
  today: Date,
  maxDays = FIRST_INSTALLMENT_MAX_DAYS,
): boolean {
  const value = startOfLocalDay(date).getTime();
  const start = startOfLocalDay(today).getTime();
  if (value < start) return false;
  const limit = startOfLocalDay(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxDays),
  ).getTime();
  return value <= limit;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Preview PRICE rounded like the backend persist (`round2`). */
export function previewInstallmentAmount(
  amount: number,
  installments: number,
  ratePercent: number,
): number {
  return roundMoney(calcInstallment(amount, installments, ratePercent));
}

/** Local YYYY-MM-DD, without UTC shift. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse YYYY-MM-DD as a local calendar date, without UTC shift. */
export function fromIsoDate(isoDate: string): Date {
  const year = Number(isoDate.slice(0, 4));
  const month = Number(isoDate.slice(5, 7));
  const day = Number(isoDate.slice(8, 10));
  return new Date(year, month - 1, day);
}

export function simulationFormDefaultsFromSnapshot(
  snapshot: Pick<
    SimulationSnapshot,
    | "name"
    | "document"
    | "birthDate"
    | "email"
    | "telephone"
    | "productId"
    | "amount"
    | "installments"
    | "firstInstallmentDate"
  >,
) {
  return {
    name: snapshot.name,
    cpf: formatCpf(snapshot.document),
    birthDate: snapshot.birthDate,
    email: snapshot.email,
    phone: formatPhone(snapshot.telephone),
    product: snapshot.productId,
    amount: snapshot.amount,
    installments: snapshot.installments,
    dueDate: fromIsoDate(snapshot.firstInstallmentDate),
  };
}

export function installmentOptionsForProduct(
  product?: Pick<
    ProductOption,
    "minInstallmentCount" | "maxInstallmentCount"
  > | null,
): number[] {
  const min = product?.minInstallmentCount ?? DEFAULT_MIN_INSTALLMENTS;
  const max = product?.maxInstallmentCount ?? DEFAULT_MAX_INSTALLMENTS;
  if (max < min) return [];
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/** Preview rate in percent (UI / local PRICE). Persist uses the API response. */
export function productRatePercent(
  product?: Pick<ProductOption, "maxInterestRate"> | null,
): number {
  if (product?.maxInterestRate == null) return 0;
  return Math.round(product.maxInterestRate * 10000) / 100;
}

export function dueDayFromIsoDate(isoDate: string): number {
  return Number(isoDate.slice(8, 10));
}

export function formatCreatedAtPtBr(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function isSimulationConverted(
  snapshot: Pick<SimulationSnapshot, "status">,
): boolean {
  return snapshot.status === SimulationStatus.CONVERTED;
}

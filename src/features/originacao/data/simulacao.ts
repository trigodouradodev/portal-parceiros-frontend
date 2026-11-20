import type { ProductOption } from "@/services/products/products.types";
import type { SimulationSnapshot } from "@/features/originacao/types";
import {
  CreditRiskBand,
  SimulationStatus,
} from "@/services/origination/origination.types";
import { formatPartyTelephone } from "@/features/originacao/mappers/map-party-to-guarantor";
import { formatCpf } from "@/lib/format/tax-id";

/**
 * Regra da data da 1ª parcela (AUREA-721): dia de 1 a 20 do mês, entre MIN e MAX
 * dias depois de hoje (limites inclusivos). Espelha o backend.
 */
export const FIRST_INSTALLMENT_MIN_DAYS = 20;
export const FIRST_INSTALLMENT_MAX_DAYS = 45;
export const FIRST_INSTALLMENT_MAX_DAY_OF_MONTH = 20;

/** O "hoje" do negócio é o de Brasília, o mesmo que o backend usa. */
const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

export const AMOUNT_MIN = 500;
export const AMOUNT_MAX = 30_000;
export const AMOUNT_DEFAULT = 5_000;

const DEFAULT_MIN_INSTALLMENTS = 2;
const DEFAULT_MAX_INSTALLMENTS = 12;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Hoje em Brasília como data local à meia-noite, para o calendário e o schema
 * contarem o mesmo dia que o backend, em qualquer fuso do navegador.
 */
export function businessToday(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function isAllowedDueDate(date: Date): boolean {
  const day = date.getDate();
  return day >= 1 && day <= FIRST_INSTALLMENT_MAX_DAY_OF_MONTH;
}

/** Primeira e última data aceitas a partir de `today` (inclusivas). */
export function firstInstallmentWindow(today: Date): {
  earliest: Date;
  latest: Date;
} {
  const base = startOfLocalDay(today);
  return {
    earliest: new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + FIRST_INSTALLMENT_MIN_DAYS,
    ),
    latest: new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + FIRST_INSTALLMENT_MAX_DAYS,
    ),
  };
}

/** Inclusive window: today + MIN .. today + MAX, as local calendar dates. */
export function isDueDateInWindow(date: Date, today: Date): boolean {
  const value = startOfLocalDay(date).getTime();
  const { earliest, latest } = firstInstallmentWindow(today);
  return value >= earliest.getTime() && value <= latest.getTime();
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime();
}

function formatDueDateBr(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Mesma mensagem do backend, com a janela de hoje. */
export function firstInstallmentRuleMessage(today: Date): string {
  const { earliest, latest } = firstInstallmentWindow(today);
  return `A primeira parcela deve cair entre ${formatDueDateBr(earliest)} e ${formatDueDateBr(latest)}, em um dia de 1 a ${FIRST_INSTALLMENT_MAX_DAY_OF_MONTH} do mês.`;
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
    phone: formatPartyTelephone(snapshot.telephone),
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

/** Score do Serasa abaixo do mínimo: reprovação automática, sem proposta. */
export function isSimulationCreditIneligible(
  snapshot: Pick<SimulationSnapshot, "creditRiskBand">,
): boolean {
  return snapshot.creditRiskBand === CreditRiskBand.INELIGIBLE;
}

export function isSimulationConverted(
  snapshot: Pick<SimulationSnapshot, "status">,
): boolean {
  return snapshot.status === SimulationStatus.CONVERTED;
}

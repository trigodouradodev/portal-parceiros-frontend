export type SimulationProduct = "Pessoal" | "Premium" | "Giro";

export const PRODUCT_RATE: Record<SimulationProduct, number> = {
  Pessoal: 3.39,
  Premium: 1.99,
  Giro: 2.89,
};

export const PRODUCTS = Object.keys(PRODUCT_RATE) as SimulationProduct[];

export const INSTALLMENT_OPTIONS = Array.from({ length: 11 }, (_, i) => i + 2);

export const ALLOWED_DUE_DAYS = [5, 10, 15, 20];

/** D+45: first installment due date cannot exceed this window from today. */
export const FIRST_INSTALLMENT_MAX_DAYS = 45;

export const AMOUNT_MIN = 500;
export const AMOUNT_MAX = 30_000;
export const AMOUNT_STEP = 100;
export const AMOUNT_DEFAULT = 5_000;

export function isAllowedDueDate(date: Date): boolean {
  return ALLOWED_DUE_DAYS.includes(date.getDate());
}

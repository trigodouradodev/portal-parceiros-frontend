import { describe, expect, it } from "vitest";
import {
  ALLOWED_DUE_DAYS,
  INSTALLMENT_OPTIONS,
  isAllowedDueDate,
  PRODUCT_RATE,
} from "@/features/originacao/data/simulacao";

describe("isAllowedDueDate", () => {
  it.each(ALLOWED_DUE_DAYS)("allows day %s of the month", (day) => {
    expect(isAllowedDueDate(new Date(2026, 7, day))).toBe(true);
  });

  it("rejects other days", () => {
    expect(isAllowedDueDate(new Date(2026, 7, 1))).toBe(false);
    expect(isAllowedDueDate(new Date(2026, 7, 13))).toBe(false);
    expect(isAllowedDueDate(new Date(2026, 7, 31))).toBe(false);
  });
});

describe("simulation constants", () => {
  it("covers 2x..12x and product rates", () => {
    expect(INSTALLMENT_OPTIONS).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(PRODUCT_RATE.Pessoal).toBe(3.39);
    expect(PRODUCT_RATE.Premium).toBe(1.99);
    expect(PRODUCT_RATE.Giro).toBe(2.89);
  });
});

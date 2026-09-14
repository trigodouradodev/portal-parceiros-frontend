import { describe, expect, it } from "vitest";
import {
  ALLOWED_DUE_DAYS,
  dueDayFromIsoDate,
  fromIsoDate,
  installmentOptionsForProduct,
  isAllowedDueDate,
  isDueDateInWindow,
  isSimulationConverted,
  previewInstallmentAmount,
  productRatePercent,
  simulationFormDefaultsFromSnapshot,
  toIsoDate,
} from "@/features/originacao/data/simulacao";

describe("isDueDateInWindow", () => {
  const today = new Date(2026, 7, 26);

  it("accepts today and the last day of the window", () => {
    expect(isDueDateInWindow(today, today)).toBe(true);
    expect(isDueDateInWindow(new Date(2026, 9, 10), today)).toBe(true);
  });

  it("rejects dates before today and after D+45", () => {
    expect(isDueDateInWindow(new Date(2026, 7, 25), today)).toBe(false);
    expect(isDueDateInWindow(new Date(2026, 9, 11), today)).toBe(false);
  });
});

describe("previewInstallmentAmount", () => {
  it("rounds PRICE to cents like the backend", () => {
    expect(previewInstallmentAmount(5000, 10, 3.39)).toBe(597.88);
  });
});

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

describe("toIsoDate", () => {
  it("formats local date without UTC shift", () => {
    expect(toIsoDate(new Date(2026, 8, 10))).toBe("2026-09-10");
  });
});

describe("fromIsoDate", () => {
  it("parses date-only ISO as a local calendar date", () => {
    const date = fromIsoDate("2026-09-10");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(10);
  });
});

describe("simulationFormDefaultsFromSnapshot", () => {
  it("maps persisted fields onto the create form", () => {
    expect(
      simulationFormDefaultsFromSnapshot({
        name: "Maria Souza",
        document: "52998224725",
        birthDate: "1990-05-20",
        email: "maria@email.com",
        telephone: "11987654321",
        productId: "11111111-1111-4111-8111-111111111111",
        amount: 8000,
        installments: 12,
        firstInstallmentDate: "2026-09-10",
      }),
    ).toEqual({
      name: "Maria Souza",
      cpf: "529.982.247-25",
      birthDate: "1990-05-20",
      email: "maria@email.com",
      phone: "(11) 98765-4321",
      product: "11111111-1111-4111-8111-111111111111",
      amount: 8000,
      installments: 12,
      dueDate: new Date(2026, 8, 10),
    });
  });
});

describe("installmentOptionsForProduct", () => {
  it("defaults to 2x..12x when the product has no bounds", () => {
    expect(installmentOptionsForProduct()).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it("uses the product installment range", () => {
    expect(
      installmentOptionsForProduct({
        minInstallmentCount: 4,
        maxInstallmentCount: 6,
      }),
    ).toEqual([4, 5, 6]);
  });
});

describe("dueDayFromIsoDate", () => {
  it("reads the day from a date-only ISO string", () => {
    expect(dueDayFromIsoDate("2026-09-05")).toBe(5);
  });
});

describe("productRatePercent", () => {
  it("converts the decimal max rate to percent for preview", () => {
    expect(productRatePercent({ maxInterestRate: 0.0339 })).toBe(3.39);
    expect(productRatePercent(null)).toBe(0);
  });
});

describe("isSimulationConverted", () => {
  it("treats converted simulations as locked", () => {
    expect(isSimulationConverted({ status: "converted" })).toBe(true);
    expect(isSimulationConverted({ status: "available" })).toBe(false);
  });
});

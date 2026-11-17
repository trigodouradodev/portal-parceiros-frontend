import { describe, expect, it } from "vitest";
import {
  businessToday,
  dueDayFromIsoDate,
  firstInstallmentRuleMessage,
  firstInstallmentWindow,
  fromIsoDate,
  installmentOptionsForProduct,
  isAllowedDueDate,
  isDueDateInWindow,
  isSimulationConverted,
  productRatePercent,
  simulationFormDefaultsFromSnapshot,
  toIsoDate,
} from "@/features/originacao/data/simulacao";

describe("isDueDateInWindow", () => {
  // Hoje = 25/03/2026: janela de 14/04 a 09/05.
  const today = new Date(2026, 2, 25);

  it.each([
    ["today + 19 (13/04)", new Date(2026, 3, 13), false],
    ["today + 20 (14/04), the first accepted day", new Date(2026, 3, 14), true],
    ["today + 45 (09/05), the last accepted day", new Date(2026, 4, 9), true],
    ["today + 46 (10/05)", new Date(2026, 4, 10), false],
    ["today itself", today, false],
  ])("window limits: %s", (_name, date, expected) => {
    expect(isDueDateInWindow(date, today)).toBe(expected);
  });

  it("crosses month and year boundaries", () => {
    const newYear = new Date(2026, 11, 28);
    expect(isDueDateInWindow(new Date(2027, 0, 17), newYear)).toBe(true);
    expect(isDueDateInWindow(new Date(2027, 1, 11), newYear)).toBe(true);
    expect(isDueDateInWindow(new Date(2027, 1, 12), newYear)).toBe(false);
  });
});

describe("firstInstallmentWindow", () => {
  it("goes from today + 20 to today + 45", () => {
    const { earliest, latest } = firstInstallmentWindow(new Date(2026, 2, 25));
    expect(toIsoDate(earliest)).toBe("2026-04-14");
    expect(toIsoDate(latest)).toBe("2026-05-09");
  });
});

describe("isAllowedDueDate", () => {
  it.each([1, 5, 13, 19, 20])("allows day %s of the month", (day) => {
    expect(isAllowedDueDate(new Date(2026, 7, day))).toBe(true);
  });

  it.each([21, 22, 28, 31])("rejects day %s of the month", (day) => {
    expect(isAllowedDueDate(new Date(2026, 7, day))).toBe(false);
  });
});

describe("firstInstallmentRuleMessage", () => {
  it("tells the window and the day limit", () => {
    expect(firstInstallmentRuleMessage(new Date(2026, 2, 25))).toBe(
      "A primeira parcela deve cair entre 14/04/2026 e 09/05/2026, em um dia de 1 a 20 do mês.",
    );
  });
});

describe("businessToday", () => {
  it("is still the same day at 22h in Brasília, when UTC is already the next", () => {
    // 10/03/2026 22:00 em Brasília = 11/03/2026 01:00 UTC
    const today = businessToday(new Date("2026-03-11T01:00:00.000Z"));
    expect(toIsoDate(today)).toBe("2026-03-10");
  });

  it("changes day at midnight in Brasília", () => {
    expect(toIsoDate(businessToday(new Date("2026-03-10T03:01:00.000Z")))).toBe(
      "2026-03-10",
    );
    expect(toIsoDate(businessToday(new Date("2026-03-10T02:59:00.000Z")))).toBe(
      "2026-03-09",
    );
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
  it.each(["11987654321", "+5511987654321", "5511987654321"])(
    "maps persisted fields onto the create form (%s)",
    (telephone) => {
      expect(
        simulationFormDefaultsFromSnapshot({
          name: "Maria Souza",
          document: "52998224725",
          birthDate: "1990-05-20",
          email: "maria@email.com",
          telephone,
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
    },
  );
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

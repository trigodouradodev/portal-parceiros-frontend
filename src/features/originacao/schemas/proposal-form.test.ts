import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import {
  POSITIVE_MONEY_MESSAGE,
  REQUIRED_FIELD_MESSAGE,
  activityIncomeSchema,
} from "@/features/originacao/schemas/proposal-form";

function baseIncome(
  overrides: Partial<
    ReturnType<typeof createEmptyProposalForm>["activityIncome"]
  > = {},
) {
  return {
    ...createEmptyProposalForm().activityIncome,
    activityTime: "six_months_to_2_years",
    monthlyIncome: "R$ 2.600,00",
    incomeSource: "salary",
    hasMultipleSources: false,
    ...overrides,
  };
}

describe("activityIncomeSchema monthlyIncome (AUREA-482)", () => {
  it("rejects empty income", () => {
    const result = activityIncomeSchema.safeParse(
      baseIncome({ monthlyIncome: "" }),
    );
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe(REQUIRED_FIELD_MESSAGE);
  });

  it("rejects zero income (R$ 0,00)", () => {
    const result = activityIncomeSchema.safeParse(
      baseIncome({ monthlyIncome: "R$ 0,00" }),
    );
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe(POSITIVE_MONEY_MESSAGE);
  });

  it("accepts positive income", () => {
    const result = activityIncomeSchema.safeParse(baseIncome());
    expect(result.success).toBe(true);
  });

  it("requires at least one additional income when multiple sources is yes", () => {
    const result = activityIncomeSchema.safeParse(
      baseIncome({ hasMultipleSources: true, additionalIncomes: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("validates source and positive amount for every additional income", () => {
    expect(
      activityIncomeSchema.safeParse(
        baseIncome({
          hasMultipleSources: true,
          additionalIncomes: [{ id: 1, source: "rent", amount: "R$ 800,00" }],
        }),
      ).success,
    ).toBe(true);

    expect(
      activityIncomeSchema.safeParse(
        baseIncome({
          hasMultipleSources: true,
          additionalIncomes: [{ id: 1, source: "", amount: "R$ 0,00" }],
        }),
      ).success,
    ).toBe(false);
  });
});

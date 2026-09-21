import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import { mapIncomeToApi } from "@/features/originacao/mappers/map-income-to-api";
import { formatMoneyBrl } from "@/lib/format/money";
import {
  ActivityDuration,
  BusinessActivityBranch,
  BusinessActivitySubcategory,
  EconomicActivityCategory,
  IncomeSource,
} from "@/services/quotes/quotes.enums";

const registration = {
  ...createEmptyProposalForm().registration,
  occupation: "Vendedora",
  activityCategories: [EconomicActivityCategory.CLT_EMPLOYEE],
  businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
  businessActivitySubcategory: BusinessActivitySubcategory.GENERAL_COMMERCE,
};

describe("mapIncomeToApi", () => {
  it("maps activity/income form fields to the income PATCH payload", () => {
    const form = createEmptyProposalForm().activityIncome;
    expect(
      mapIncomeToApi(
        {
          ...form,
          cnpj: "11.222.333/0001-81",
          activityTime: ActivityDuration.ONE_TO_3_YEARS,
          monthlyIncome: formatMoneyBrl("350000"),
          incomeSource: IncomeSource.SALARY,
          hasMultipleSources: true,
          additionalIncomes: [
            {
              id: 1,
              source: IncomeSource.RENT,
              amount: formatMoneyBrl("80000"),
            },
            {
              id: 2,
              source: IncomeSource.OTHER,
              amount: formatMoneyBrl("25000"),
            },
          ],
        },
        registration,
      ),
    ).toEqual({
      profession: "Vendedora",
      economicActivityCategories: [EconomicActivityCategory.CLT_EMPLOYEE],
      businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
      businessActivitySubcategory: BusinessActivitySubcategory.GENERAL_COMMERCE,
      activityDuration: ActivityDuration.ONE_TO_3_YEARS,
      declaredMonthlyIncome: 3500,
      incomeSource: IncomeSource.SALARY,
      hasMultipleIncomeSources: true,
      additionalIncomes: [
        { source: IncomeSource.RENT, amount: 800 },
        { source: IncomeSource.OTHER, amount: 250 },
      ],
    });
  });

  it("never sends CNPJ and omits secondary income when not applicable", () => {
    const form = createEmptyProposalForm().activityIncome;
    const payload = mapIncomeToApi(
      {
        ...form,
        activityTime: ActivityDuration.LESS_THAN_6_MONTHS,
        monthlyIncome: formatMoneyBrl("100000"),
        incomeSource: IncomeSource.OWN_BUSINESS,
        hasMultipleSources: false,
      },
      registration,
    );

    expect(payload).not.toHaveProperty("businessDocument");
    expect(payload).not.toHaveProperty("availableIncomeProof");
    expect(payload.additionalIncomes).toEqual([]);
    expect(payload.hasMultipleIncomeSources).toBe(false);
    expect(payload.declaredMonthlyIncome).toBe(1000);
  });

  it("uses a provisional activity duration when the parecer field is still empty", () => {
    const form = createEmptyProposalForm().activityIncome;
    const payload = mapIncomeToApi(
      {
        ...form,
        monthlyIncome: formatMoneyBrl("100000"),
        incomeSource: IncomeSource.SALARY,
      },
      registration,
    );
    expect(payload.activityDuration).toBe(ActivityDuration.LESS_THAN_6_MONTHS);
  });
});

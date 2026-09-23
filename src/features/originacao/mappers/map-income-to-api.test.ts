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
  IncomeEntryRole,
} from "@/services/quotes/quotes.enums";

const secondaryIncome = (id: number, source: IncomeSource, amount: string) => ({
  id,
  activityCategories: [EconomicActivityCategory.BUSINESS_OWNER],
  activityCategoryOther: "",
  occupation: "",
  businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
  businessActivitySubcategory: BusinessActivitySubcategory.GENERAL_COMMERCE,
  activityTime: ActivityDuration.ONE_TO_3_YEARS,
  source,
  amount,
  familyRelationship: "",
});

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
          activityTime: ActivityDuration.ONE_TO_3_YEARS,
          monthlyIncome: formatMoneyBrl("350000"),
          incomeSource: IncomeSource.SALARY,
          additionalIncomes: [
            secondaryIncome(1, IncomeSource.RENT, formatMoneyBrl("80000")),
            secondaryIncome(2, IncomeSource.OTHER, formatMoneyBrl("25000")),
          ],
        },
        registration,
      ),
    ).toEqual({
      incomes: [
        {
          id: "primary",
          role: IncomeEntryRole.PRIMARY,
          economicActivity: EconomicActivityCategory.CLT_EMPLOYEE,
          profession: "Vendedora",
          businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
          businessActivitySubcategory:
            BusinessActivitySubcategory.GENERAL_COMMERCE,
          activityDuration: ActivityDuration.ONE_TO_3_YEARS,
          amount: 3500,
          source: IncomeSource.SALARY,
        },
        {
          id: "secondary-1",
          role: IncomeEntryRole.SECONDARY,
          economicActivity: EconomicActivityCategory.BUSINESS_OWNER,
          businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
          businessActivitySubcategory:
            BusinessActivitySubcategory.GENERAL_COMMERCE,
          activityDuration: ActivityDuration.ONE_TO_3_YEARS,
          amount: 800,
          source: IncomeSource.RENT,
        },
        {
          id: "secondary-2",
          role: IncomeEntryRole.SECONDARY,
          economicActivity: EconomicActivityCategory.BUSINESS_OWNER,
          businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
          businessActivitySubcategory:
            BusinessActivitySubcategory.GENERAL_COMMERCE,
          activityDuration: ActivityDuration.ONE_TO_3_YEARS,
          amount: 250,
          source: IncomeSource.OTHER,
        },
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
      },
      registration,
    );

    expect(payload).not.toHaveProperty("businessDocument");
    expect(payload).not.toHaveProperty("availableIncomeProof");
    expect(payload.incomes).toHaveLength(1);
    expect(payload.incomes[0].amount).toBe(1000);
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
    expect(payload.incomes[0].activityDuration).toBe(
      ActivityDuration.LESS_THAN_6_MONTHS,
    );
  });
});

import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import { mapFinancialToApi } from "@/features/originacao/mappers/map-financial-to-api";
import {
  ExpenseCategory,
  LoanCategory,
  LoanFrequency,
  LoanInstitution,
} from "@/services/quotes/quotes.enums";

describe("mapFinancialToApi", () => {
  it("maps expenses and loans and omits empty descriptions", () => {
    const form = createEmptyProposalForm().financial;
    expect(
      mapFinancialToApi({
        ...form,
        expenses: [
          {
            id: 1,
            category: ExpenseCategory.HOUSING_OR_RENT,
            amount: "R$ 850,00",
            description: "",
          },
        ],
        loans: [
          {
            id: 2,
            installmentAmount: "R$ 420,50",
            frequency: LoanFrequency.MONTHLY,
            institution: LoanInstitution.NUBANK,
            category: LoanCategory.CREDIT_CARD,
            description: "  Capital de giro  ",
          },
        ],
      }),
    ).toEqual({
      expenses: [
        {
          category: ExpenseCategory.HOUSING_OR_RENT,
          amount: 850,
        },
      ],
      loans: [
        {
          installmentAmount: 420.5,
          frequency: LoanFrequency.MONTHLY,
          institution: LoanInstitution.NUBANK,
          category: LoanCategory.CREDIT_CARD,
          description: "Capital de giro",
        },
      ],
    });
  });

  it("skips blank rows and accepts empty lists", () => {
    const form = createEmptyProposalForm().financial;
    expect(
      mapFinancialToApi({
        ...form,
        expenses: [{ id: 1, category: "", amount: "", description: "" }],
        loans: [
          {
            id: 2,
            installmentAmount: "",
            frequency: "",
            institution: "",
            category: "",
            description: "",
          },
        ],
      }),
    ).toEqual({ expenses: [], loans: [] });
  });

  it("requires description for Other expense", () => {
    const form = createEmptyProposalForm().financial;
    expect(() =>
      mapFinancialToApi({
        ...form,
        expenses: [
          {
            id: 1,
            category: ExpenseCategory.OTHER,
            amount: "R$ 10,00",
            description: "",
          },
        ],
      }),
    ).toThrow(/descrição da despesa 1/i);
  });

  it("requires description for Other loan institution", () => {
    const form = createEmptyProposalForm().financial;
    expect(() =>
      mapFinancialToApi({
        ...form,
        loans: [
          {
            id: 1,
            installmentAmount: "R$ 10,00",
            frequency: LoanFrequency.WEEKLY,
            institution: LoanInstitution.OTHER,
            category: LoanCategory.OTHER,
            description: "",
          },
        ],
      }),
    ).toThrow(/descrição do empréstimo 1/i);
  });
});

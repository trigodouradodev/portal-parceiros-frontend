import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import { mapFinancialToApi } from "@/features/originacao/mappers/map-financial-to-api";
import {
  ExpenseCategory,
  LoanCategory,
  LoanFrequency,
  LoanInstitution,
  PaymentPixType,
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
      paymentPixType: "",
      paymentPixCode: "",
    });
  });

  it("skips blank rows and accepts empty lists", () => {
    const form = createEmptyProposalForm().financial;
    expect(
      mapFinancialToApi({
        ...form,
        paymentPixType: PaymentPixType.CPF,
        paymentPixCode: "529.982.247-25",
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
    ).toEqual({
      expenses: [],
      loans: [],
      paymentPixType: PaymentPixType.CPF,
      paymentPixCode: "52998224725",
    });
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

  it("normalizes PIX keys to the persisted contract", () => {
    const form = createEmptyProposalForm().financial;

    expect(
      mapFinancialToApi({
        ...form,
        paymentPixType: PaymentPixType.TELEPHONE,
        paymentPixCode: "(11) 99123-4567",
      }).paymentPixCode,
    ).toBe("+5511991234567");

    expect(
      mapFinancialToApi({
        ...form,
        paymentPixType: PaymentPixType.EMAIL,
        paymentPixCode: "Cliente@Exemplo.com",
      }).paymentPixCode,
    ).toBe("cliente@exemplo.com");

    expect(
      mapFinancialToApi({
        ...form,
        paymentPixType: PaymentPixType.RANDOM_KEY,
        paymentPixCode: "4CA519EF-0CCC-4C41-B58B-C88F1F47D8AB",
      }).paymentPixCode,
    ).toBe("4ca519ef-0ccc-4c41-b58b-c88f1f47d8ab");
  });
});

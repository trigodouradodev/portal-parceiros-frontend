import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import {
  REQUIRED_FIELD_MESSAGE,
  getProposalStepFieldErrors,
} from "@/features/originacao/utils/proposal-step-errors";
import { MaritalStatus } from "@/services/quotes/quotes.enums";

describe("getProposalStepFieldErrors", () => {
  it("lists registration required fields in visual order", () => {
    const empty = createEmptyProposalForm();
    expect([
      ...new Set(getProposalStepFieldErrors(0, empty).map((item) => item.name)),
    ]).toEqual([
      "registration.isRenewal",
      "registration.name",
      "registration.birthDate",
      "registration.gender",
      "registration.cpf",
      "registration.rg",
      "registration.email",
      "registration.phone",
      "registration.maritalStatus",
      "registration.childrenCount",
      "registration.householdSize",
      "registration.propertyStatus",
      "registration.residenceTime",
      "registration.hasVehicle",
      "registration.creditPurpose",
    ]);
    expect(getProposalStepFieldErrors(0, empty)[0]?.message).toBe(
      REQUIRED_FIELD_MESSAGE,
    );
  });

  it("flags spouse CPF even when other cadastro fields are still empty", () => {
    const data = createEmptyProposalForm();
    data.registration.maritalStatus = MaritalStatus.MARRIED;
    const errors = getProposalStepFieldErrors(0, data);
    expect(errors.map((item) => item.name)).toContain("registration.spouseCpf");
    expect(
      errors.find((item) => item.name === "registration.spouseCpf")?.message,
    ).toBe(REQUIRED_FIELD_MESSAGE);

    data.registration.spouseCpf = "000.000.000-00";
    expect(
      getProposalStepFieldErrors(0, data).find(
        (item) => item.name === "registration.spouseCpf",
      )?.message,
    ).toBe("CPF inválido");
  });

  it("returns no errors on a valid activity/income step", () => {
    const data = createEmptyProposalForm();
    data.activityIncome = {
      ...data.activityIncome,
      activityTime: "1_to_3_years",
      monthlyIncome: "3000",
      incomeSource: "Salário",
    };
    data.registration.activityCategories = ["clt_employee"];
    data.registration.occupation = "Vendedora";
    data.registration.businessActivityBranch = "food";
    data.registration.businessActivitySubcategory = "restaurant_or_snack_bar";
    expect(getProposalStepFieldErrors(1, data)).toEqual([]);
  });

  it("requires referrer CPF on Áurea customer referral", () => {
    const data = createEmptyProposalForm();
    data.partnerOpinion = {
      ...data.partnerOpinion,
      relationshipTime: "1_to_3_years",
      howKnows: "aurea_customer_referral",
      overallRating: "recommend",
      informalDebtSigns: false,
      financialUrgencySigns: false,
      notes: "Cliente conhecido.",
    };
    expect(
      getProposalStepFieldErrors(3, data).find(
        (item) => item.name === "partnerOpinion.referrerCpf",
      )?.message,
    ).toBe(REQUIRED_FIELD_MESSAGE);

    data.partnerOpinion.referrerCpf = "000.000.000-00";
    expect(
      getProposalStepFieldErrors(3, data).find(
        (item) => item.name === "partnerOpinion.referrerCpf",
      )?.message,
    ).toBe("CPF inválido");

    data.partnerOpinion.referrerCpf = "529.982.247-25";
    expect(getProposalStepFieldErrors(3, data)).toEqual([]);
  });

  it("requires atividade econômica, profissão e ramo de atividade (dados do Cadastro) no step Atividade e Renda", () => {
    const data = createEmptyProposalForm();
    data.activityIncome = {
      ...data.activityIncome,
      activityTime: "1_to_3_years",
      monthlyIncome: "3000",
      incomeSource: "salary",
    };
    expect(
      getProposalStepFieldErrors(1, data).map((item) => item.name),
    ).toEqual([
      "registration.activityCategories",
      "registration.occupation",
      "registration.businessActivityBranch",
    ]);

    data.registration.activityCategories = ["other"];
    expect(
      getProposalStepFieldErrors(1, data).find(
        (item) => item.name === "registration.activityCategoryOther",
      )?.message,
    ).toBe(REQUIRED_FIELD_MESSAGE);

    data.registration.activityCategoryOther = "Artesanato";
    data.registration.occupation = "Comerciante";
    expect(
      getProposalStepFieldErrors(1, data).find(
        (item) => item.name === "registration.businessActivityBranch",
      )?.message,
    ).toBe(REQUIRED_FIELD_MESSAGE);

    data.registration.businessActivityBranch = "retail_commerce";
    expect(
      getProposalStepFieldErrors(1, data).find(
        (item) => item.name === "registration.businessActivitySubcategory",
      )?.message,
    ).toBe(REQUIRED_FIELD_MESSAGE);

    data.registration.businessActivitySubcategory = "general_commerce";
    expect(getProposalStepFieldErrors(1, data)).toEqual([]);
  });

  it("requires PIX fields on the financial step", () => {
    const empty = createEmptyProposalForm();
    expect(
      getProposalStepFieldErrors(5, empty).map((item) => item.name),
    ).toEqual(["financial.paymentPixType", "financial.paymentPixCode"]);

    empty.financial.paymentPixType = "CPF";
    empty.financial.paymentPixCode = "529.982.247-25";
    expect(getProposalStepFieldErrors(5, empty)).toEqual([]);
  });
});

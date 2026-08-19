import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import {
  REQUIRED_FIELD_MESSAGE,
  getProposalStepFieldErrors,
} from "@/features/originacao/utils/proposal-step-errors";

describe("getProposalStepFieldErrors", () => {
  it("lists registration required fields in visual order", () => {
    const empty = createEmptyProposalForm();
    expect(getProposalStepFieldErrors(0, empty).map((item) => item.name)).toEqual(
      [
        "registration.isRenewal",
        "registration.gender",
        "registration.occupation",
        "registration.activityCategories",
        "registration.creditPurpose",
      ],
    );
    expect(getProposalStepFieldErrors(0, empty)[0]?.message).toBe(
      REQUIRED_FIELD_MESSAGE,
    );
  });

  it("returns no errors on a valid activity/income step", () => {
    const data = createEmptyProposalForm();
    data.activityIncome = {
      ...data.activityIncome,
      activityTime: "1 a 3 anos",
      monthlyIncome: "3000",
      incomeSource: "Salário",
      availableProof: "Holerite",
    };
    expect(getProposalStepFieldErrors(1, data)).toEqual([]);
  });

  it("keeps the financial step without blocking errors", () => {
    expect(getProposalStepFieldErrors(5, createEmptyProposalForm())).toEqual(
      [],
    );
  });
});

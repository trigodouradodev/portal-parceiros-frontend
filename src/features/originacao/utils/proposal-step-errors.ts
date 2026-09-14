import type { FieldPath } from "react-hook-form";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import {
  REQUIRED_FIELD_MESSAGE,
  parseProposalStep,
} from "@/features/originacao/schemas/proposal-form";

export { REQUIRED_FIELD_MESSAGE };

export interface ProposalFieldError {
  name: FieldPath<ProposalFormData>;
  message: string;
}

export function getProposalStepFieldErrors(
  step: number,
  data: ProposalFormData,
): ProposalFieldError[] {
  const parsed = parseProposalStep(step, data);
  if (parsed.success) return [];

  const prefix = (
    [
      "registration",
      "activityIncome",
      "address",
      "partnerOpinion",
      "guarantor",
      "financial",
      "documents",
    ] as const
  )[step];

  return parsed.error.issues.map((issue) => ({
    name: [prefix, ...issue.path.map(String)]
      .filter(Boolean)
      .join(".") as FieldPath<ProposalFormData>,
    message: issue.message,
  }));
}

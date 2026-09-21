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

const PROPOSAL_FORM_SLICE_KEYS = [
  "registration",
  "activityIncome",
  "address",
  "partnerOpinion",
  "guarantor",
  "financial",
  "documents",
] as const;

export function getProposalStepFieldErrors(
  step: number,
  data: ProposalFormData,
): ProposalFieldError[] {
  const parsed = parseProposalStep(step, data);
  if (parsed.success) return [];

  const prefix = PROPOSAL_FORM_SLICE_KEYS[step];

  return parsed.error.issues.map((issue) => {
    const path = issue.path.map(String);
    // Um step pode validar campos de outra fatia do form (ex.: o Ramo de
    // atividade, que é dado de `registration` mas é exigido no step
    // Atividade e Renda) — nesses casos o path já vem totalmente
    // qualificado e não deve levar o prefixo do step atual.
    if ((PROPOSAL_FORM_SLICE_KEYS as readonly string[]).includes(path[0])) {
      return {
        name: path.join(".") as FieldPath<ProposalFormData>,
        message: issue.message,
      };
    }
    return {
      name: [prefix, ...path]
        .filter(Boolean)
        .join(".") as FieldPath<ProposalFormData>,
      message: issue.message,
    };
  });
}

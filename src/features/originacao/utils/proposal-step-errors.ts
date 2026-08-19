import type { FieldPath } from "react-hook-form";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { calcAge, isAdultAge } from "@/features/originacao/utils/calc-age";
import { isCompleteCep } from "@/features/originacao/utils/format-cep";
import { isOptionalCpfValid, isValidCpf } from "@/lib/validation/cpf";

export const REQUIRED_FIELD_MESSAGE = "Campo obrigatório";

export interface ProposalFieldError {
  name: FieldPath<ProposalFormData>;
  message: string;
}

function requiredIfEmpty(
  name: FieldPath<ProposalFormData>,
  invalid: boolean,
  message = REQUIRED_FIELD_MESSAGE,
): ProposalFieldError[] {
  return invalid ? [{ name, message }] : [];
}

function registrationErrors(
  data: ProposalFormData["registration"],
): ProposalFieldError[] {
  return [
    ...requiredIfEmpty("registration.isRenewal", data.isRenewal === null),
    ...requiredIfEmpty("registration.gender", data.gender === ""),
    ...requiredIfEmpty(
      "registration.activityCategories",
      data.activityCategories.length === 0,
    ),
    ...requiredIfEmpty(
      "registration.spouseCpf",
      !isOptionalCpfValid(data.spouseCpf),
      "CPF inválido",
    ),
    ...requiredIfEmpty(
      "registration.creditPurpose",
      data.creditPurpose === null,
    ),
  ];
}

function activityIncomeErrors(
  data: ProposalFormData["activityIncome"],
): ProposalFieldError[] {
  return [
    ...requiredIfEmpty("activityIncome.activityTime", data.activityTime === ""),
    ...requiredIfEmpty(
      "activityIncome.monthlyIncome",
      data.monthlyIncome.trim() === "",
    ),
    ...requiredIfEmpty("activityIncome.incomeSource", data.incomeSource === ""),
    ...requiredIfEmpty(
      "activityIncome.availableProof",
      data.availableProof === "",
    ),
  ];
}

function addressErrors(
  data: ProposalFormData["address"],
): ProposalFieldError[] {
  return [
    ...requiredIfEmpty(
      "address.zipCode",
      !isCompleteCep(data.zipCode),
      data.zipCode.trim() === ""
        ? REQUIRED_FIELD_MESSAGE
        : "Informe um CEP válido",
    ),
    ...requiredIfEmpty("address.street", data.street.trim() === ""),
    ...requiredIfEmpty("address.number", data.number.trim() === ""),
    ...requiredIfEmpty(
      "address.neighborhood",
      data.neighborhood.trim() === "",
    ),
    ...requiredIfEmpty("address.city", data.city.trim() === ""),
    ...requiredIfEmpty("address.state", data.state === ""),
  ];
}

function partnerOpinionErrors(
  data: ProposalFormData["partnerOpinion"],
): ProposalFieldError[] {
  return [
    ...requiredIfEmpty(
      "partnerOpinion.relationshipTime",
      data.relationshipTime === "",
    ),
    ...requiredIfEmpty("partnerOpinion.howKnows", data.howKnows === ""),
    ...requiredIfEmpty(
      "partnerOpinion.referrerCpf",
      !isOptionalCpfValid(data.referrerCpf),
      "CPF inválido",
    ),
    ...requiredIfEmpty(
      "partnerOpinion.overallRating",
      data.overallRating === "",
    ),
    ...requiredIfEmpty(
      "partnerOpinion.informalDebtSigns",
      data.informalDebtSigns === null,
    ),
    ...requiredIfEmpty(
      "partnerOpinion.financialUrgencySigns",
      data.financialUrgencySigns === null,
    ),
    ...requiredIfEmpty("partnerOpinion.notes", data.notes.trim() === ""),
  ];
}

function guarantorErrors(
  data: ProposalFormData["guarantor"],
): ProposalFieldError[] {
  const age = calcAge(data.birthDate);
  const cpfDigits = data.cpf.replace(/\D/g, "");
  const birthEmpty = data.birthDate.trim() === "";

  return [
    ...requiredIfEmpty("guarantor.name", data.name.trim() === ""),
    ...requiredIfEmpty(
      "guarantor.cpf",
      !isValidCpf(data.cpf),
      cpfDigits.length === 0 ? REQUIRED_FIELD_MESSAGE : "CPF inválido",
    ),
    ...requiredIfEmpty(
      "guarantor.birthDate",
      birthEmpty || !isAdultAge(age),
      birthEmpty
        ? "Informe a data de nascimento"
        : "O avalista deve ter entre 18 e 120 anos.",
    ),
    ...requiredIfEmpty("guarantor.email", data.email.trim() === ""),
    ...requiredIfEmpty("guarantor.phone", data.phone.trim() === ""),
    ...requiredIfEmpty(
      "guarantor.zipCode",
      !isCompleteCep(data.zipCode),
      data.zipCode.trim() === ""
        ? REQUIRED_FIELD_MESSAGE
        : "Informe um CEP válido",
    ),
    ...requiredIfEmpty("guarantor.number", data.number.trim() === ""),
    ...requiredIfEmpty(
      "guarantor.neighborhood",
      data.neighborhood.trim() === "",
    ),
    ...requiredIfEmpty("guarantor.city", data.city.trim() === ""),
    ...requiredIfEmpty("guarantor.state", data.state === ""),
    ...requiredIfEmpty("guarantor.kinship", data.kinship === ""),
  ];
}

function documentsErrors(
  data: ProposalFormData["documents"],
): ProposalFieldError[] {
  return [
    ...requiredIfEmpty(
      "documents.identification",
      data.identification.length === 0,
    ),
    ...requiredIfEmpty(
      "documents.proofOfResidence",
      data.proofOfResidence.length === 0,
    ),
    ...requiredIfEmpty(
      "documents.activityPhotos",
      data.activityPhotos.length === 0,
    ),
    ...requiredIfEmpty(
      "documents.incomeProofTypes",
      data.incomeProofTypes.length === 0,
    ),
    ...requiredIfEmpty(
      "documents.incomeProofs",
      data.incomeProofs.length === 0,
    ),
  ];
}

export function getProposalStepFieldErrors(
  step: number,
  data: ProposalFormData,
): ProposalFieldError[] {
  switch (step) {
    case 0:
      return registrationErrors(data.registration);
    case 1:
      return activityIncomeErrors(data.activityIncome);
    case 2:
      return addressErrors(data.address);
    case 3:
      return partnerOpinionErrors(data.partnerOpinion);
    case 4:
      return guarantorErrors(data.guarantor);
    case 5:
      return [];
    case 6:
      return documentsErrors(data.documents);
    default:
      return [];
  }
}

import {
  PROPOSAL_STEPS,
  createEmptyProposalForm,
  type ActivityIncomeData,
  type AddressData,
  type DocumentsData,
  type ExpenseItem,
  type FinancialData,
  type GuarantorData,
  type LoanItem,
  type PartnerOpinionData,
  type ProposalFormData,
  type ProposalSnapshot,
  type RegistrationData,
} from "@/features/originacao/data/proposal";
import { fmtBRL } from "@/lib/format/money";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import { SimulationStatus } from "@/services/origination/origination.types";
import { QuoteDraftStep, QuoteStatus } from "@/services/quotes/quotes.enums";
import type {
  QuoteDetail,
  QuoteDocumentationDetail,
  QuoteFinancialDetail,
  QuoteGuarantorDetail,
} from "@/services/quotes/quotes.types";

/** Ordem dos passos do wizard alinhada a `PROPOSAL_STEPS`. */
export const QUOTE_WIZARD_STEPS: QuoteDraftStep[] = [
  QuoteDraftStep.REGISTRATION,
  QuoteDraftStep.INCOME,
  QuoteDraftStep.ADDRESS,
  QuoteDraftStep.PARTNER_OPINION,
  QuoteDraftStep.GUARANTOR,
  QuoteDraftStep.FINANCIAL,
  QuoteDraftStep.DOCUMENTATION,
];

export function nextWizardStepIndex(completedSteps: QuoteDraftStep[]): number {
  const done = new Set(completedSteps);
  const index = QUOTE_WIZARD_STEPS.findIndex((step) => !done.has(step));
  if (index === -1) return Math.max(0, QUOTE_WIZARD_STEPS.length - 1);
  return index;
}

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

function moneyOrEmpty(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return fmtBRL(value);
}

function countOrEmpty(value: number | null | undefined): string {
  if (value == null) return "";
  return String(value);
}

function mapRegistration(
  detail: QuoteDetail["registration"],
): RegistrationData {
  const empty = createEmptyProposalForm().registration;
  return {
    ...empty,
    isRenewal: detail.isRenegotiation,
    gender: detail.gender ?? "",
    rg: detail.secondaryDocument ?? "",
    occupation: detail.profession ?? "",
    activityCategories: detail.economicActivityCategories ?? [],
    activityCategoryOther: detail.economicActivityOther ?? "",
    maritalStatus: detail.maritalStatus ?? "",
    spouseCpf: detail.spouseDocument ? formatCpf(detail.spouseDocument) : "",
    childrenCount: countOrEmpty(detail.childrenCount),
    householdSize: countOrEmpty(detail.householdMembers),
    propertyStatus: detail.housingStatus ?? "",
    residenceTime: detail.residenceDuration ?? "",
    governmentPrograms: detail.governmentPrograms ?? [],
    hasVehicle: detail.ownsVehicle,
    vehicleFinanced: detail.vehicleFinanced,
    creditPurpose: detail.creditPurpose,
  };
}

function mapIncome(detail: QuoteDetail["income"]): ActivityIncomeData {
  return {
    cnpj: detail.businessDocument ?? "",
    activityTime: detail.activityDuration ?? "",
    monthlyIncome: moneyOrEmpty(detail.declaredMonthlyIncome),
    incomeSource: detail.incomeSource ?? "",
    hasMultipleSources: detail.hasMultipleIncomeSources,
    secondaryIncome: moneyOrEmpty(detail.secondaryIncome),
    availableProof: detail.availableIncomeProof ?? "",
  };
}

function mapAddress(detail: QuoteDetail["address"]): AddressData {
  return {
    zipCode: detail.zipCode ?? "",
    street: detail.streetName ?? "",
    number: detail.streetNumber ?? "",
    complement: detail.streetComplement ?? "",
    neighborhood: detail.streetDistrict ?? "",
    city: detail.city ?? "",
    state: detail.state ?? "",
    landmark: detail.referencePoint ?? "",
    geolocation: detail.geolocation
      ? {
          latitude: detail.geolocation.latitude,
          longitude: detail.geolocation.longitude,
          precision: detail.geolocation.precision,
        }
      : null,
  };
}

function mapPartnerOpinion(
  detail: QuoteDetail["partnerOpinion"],
): PartnerOpinionData {
  return {
    relationshipTime: detail.relationshipDuration ?? "",
    howKnows: detail.relationshipOrigin ?? "",
    howKnowsOther: detail.relationshipOriginOther ?? "",
    referrerCpf: detail.referrerDocument
      ? formatCpf(detail.referrerDocument)
      : "",
    overallRating: detail.assessment ?? "",
    informalDebtSigns: detail.hasInformalDebtSigns,
    financialUrgencySigns: detail.hasFinancialUrgencySigns,
    notes: detail.opinion ?? "",
  };
}

function mapGuarantor(detail: QuoteGuarantorDetail | null): GuarantorData {
  const empty = createEmptyProposalForm().guarantor;
  if (!detail) return empty;
  return {
    name: detail.name,
    cpf: formatCpf(detail.document),
    birthDate: detail.birthDate,
    email: detail.email,
    phone: formatPhone(detail.telephone),
    zipCode: detail.address.zipCode ?? "",
    street: detail.address.streetName ?? "",
    number: detail.address.streetNumber ?? "",
    complement: detail.address.streetComplement ?? "",
    neighborhood: detail.address.streetDistrict ?? "",
    city: detail.address.city ?? "",
    state: detail.address.state ?? "",
    kinship: detail.relationship ?? "",
  };
}

function mapFinancial(detail: QuoteFinancialDetail): FinancialData {
  const expenses: ExpenseItem[] = detail.expenses.map((item, index) => ({
    id: index + 1,
    category: item.category,
    amount: moneyOrEmpty(item.amount),
    description: item.description ?? "",
  }));
  const loans: LoanItem[] = detail.loans.map((item, index) => ({
    id: expenses.length + index + 1,
    installmentAmount: moneyOrEmpty(item.installmentAmount),
    frequency: item.frequency,
    institution: item.institution,
    category: item.category,
    description: item.description ?? "",
  }));
  return {
    expenses,
    loans,
    nextId: expenses.length + loans.length + 1,
  };
}

function mapDocuments(detail: QuoteDocumentationDetail): DocumentsData {
  const incomeTypes = [
    ...new Set(
      detail.proofOfIncome
        .map((item) => item.incomeProofType)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  return {
    identification: detail.identificationDocuments.map((item) => item.filename),
    proofOfResidence: detail.proofOfResidence.map((item) => item.filename),
    activityPhotos: detail.activityPhotos.map((item) => item.filename),
    incomeProofTypes: incomeTypes,
    incomeProofs: detail.proofOfIncome.map((item) => item.filename),
  };
}

export function mapQuoteDetailToForm(detail: QuoteDetail): ProposalFormData {
  return {
    registration: mapRegistration(detail.registration),
    activityIncome: mapIncome(detail.income),
    address: mapAddress(detail.address),
    partnerOpinion: mapPartnerOpinion(detail.partnerOpinion),
    guarantor: mapGuarantor(detail.guarantor),
    financial: mapFinancial(detail.financial),
    documents: mapDocuments(detail.documentation),
  };
}

export function mapQuoteDetailToProposal(
  detail: QuoteDetail,
): ProposalSnapshot {
  const step = nextWizardStepIndex(detail.completedSteps);
  const isDraft = detail.status === QuoteStatus.DRAFT;
  return {
    id: detail.id,
    createdAt: formatTimestamp(detail.createdAt),
    updatedAt: formatTimestamp(detail.updatedAt),
    status: isDraft ? "draft" : "completed",
    canEdit: detail.canEdit,
    simulation: {
      id: detail.simulationId ?? detail.id,
      createdAt: detail.createdAt ?? "",
      status: SimulationStatus.CONVERTED,
      name: detail.name,
      birthDate: detail.birthDate ?? "",
      email: detail.email,
      telephone: detail.telephone,
      document: detail.document,
      productId: detail.productId,
      productName: detail.productName,
      interestRate: detail.interestRate ?? 0,
      amount: detail.financeAmount,
      installments: detail.installmentNumbers,
      firstInstallmentDate: detail.firstInstallmentDate,
      installmentAmount: detail.installmentAmount ?? 0,
      ...(detail.totalAmountOwed != null
        ? { totalAmountOwed: detail.totalAmountOwed }
        : {}),
    },
    step,
    stepValid: Array(PROPOSAL_STEPS.length).fill(false),
    data: mapQuoteDetailToForm(detail),
  };
}

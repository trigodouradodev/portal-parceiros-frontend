import type {
  ActivityDuration,
  AvailableIncomeProof,
  CreditPurpose,
  CustomerRelationshipDuration,
  CustomerRelationshipOrigin,
  EconomicActivityCategory,
  ExpenseCategory,
  Gender,
  GovernmentProgram,
  GuarantorRelationship,
  HousingStatus,
  IncomeSource,
  LoanCategory,
  LoanFrequency,
  LoanInstitution,
  MaritalStatus,
  PartnerAssessment,
  QuoteDraftStep,
  QuoteStatus,
  ResidenceDuration,
} from "./quotes.enums";

/** Aliases usados pelo fluxo AUREA-429 (registration). */
export type QuoteDraftStatus = typeof QuoteStatus.DRAFT | "draft";
export type QuoteGender = Gender;
export type QuoteEconomicActivityCategory = EconomicActivityCategory;
export type QuoteMaritalStatus = MaritalStatus;
export type QuoteHousingStatus = HousingStatus;
export type QuoteResidenceDuration = ResidenceDuration;
export type QuoteGovernmentProgram = GovernmentProgram;
export type QuoteCreditPurpose = CreditPurpose;

export interface CreateDraftQuotePayload {
  simulationId: string;
}

export interface QuoteDraftAddressPrefill {
  zipCode: string;
  streetName: string;
  streetNumber: string;
  streetComplement: string;
  streetDistrict: string;
  city: string;
  state: string;
  referencePoint?: string | null;
}

/** Resposta de POST /quotes/draft */
export interface QuoteDraftSnapshot {
  id: string;
  simulationId: string;
  status: QuoteDraftStatus;
  createdAt: string;
  name: string;
  document: string;
  birthDate: string;
  email: string;
  telephone: string;
  productId: string;
  productName: string;
  interestRate: number;
  financeAmount: number;
  installmentNumbers: number;
  firstInstallmentDate: string;
  installmentAmount: number;
  totalAmountOwed?: number;
  address?: QuoteDraftAddressPrefill;
}

export interface SaveQuoteRegistrationPayload {
  isRenegotiation: boolean;
  gender: Gender;
  secondaryDocument: string;
  profession: string;
  economicActivityCategories: EconomicActivityCategory[];
  economicActivityOther?: string;
  maritalStatus: MaritalStatus;
  spouseDocument?: string;
  childrenCount: number;
  householdMembers: number;
  housingStatus: HousingStatus;
  residenceDuration: ResidenceDuration;
  governmentPrograms: GovernmentProgram[];
  ownsVehicle: boolean;
  vehicleFinanced?: boolean;
  creditPurpose: CreditPurpose;
}

export interface QuoteRegistrationSnapshot extends SaveQuoteRegistrationPayload {
  id: string;
  status: QuoteDraftStatus;
  step: typeof QuoteDraftStep.REGISTRATION | "registration";
  completedAt: string;
  updatedAt: string;
}

export interface SaveQuoteIncomePayload {
  businessDocument?: string;
  activityDuration: ActivityDuration;
  declaredMonthlyIncome: number;
  incomeSource: IncomeSource;
  hasMultipleIncomeSources: boolean;
  secondaryIncome?: number;
  availableIncomeProof: AvailableIncomeProof;
}

export interface QuoteIncomeSnapshot extends SaveQuoteIncomePayload {
  id: string;
  status: QuoteDraftStatus;
  step: typeof QuoteDraftStep.INCOME | "income";
  completedAt: string;
  updatedAt: string;
}

export interface QuoteGeolocationPayload {
  latitude: number;
  longitude: number;
  precision: string;
}

export interface SaveQuoteAddressPayload {
  zipCode: string;
  streetName: string;
  streetNumber: string;
  streetComplement?: string;
  streetDistrict: string;
  city: string;
  state: string;
  referencePoint: string;
  geolocation?: QuoteGeolocationPayload | null;
}

export interface QuoteAddressSnapshot extends SaveQuoteAddressPayload {
  id: string;
  status: QuoteDraftStatus;
  step: typeof QuoteDraftStep.ADDRESS | "address";
  completedAt: string;
  updatedAt: string;
}

export interface SaveQuotePartnerOpinionPayload {
  relationshipDuration: CustomerRelationshipDuration;
  relationshipOrigin: CustomerRelationshipOrigin;
  relationshipOriginOther?: string;
  referrerDocument?: string;
  assessment: PartnerAssessment;
  hasInformalDebtSigns: boolean;
  hasFinancialUrgencySigns: boolean;
  opinion: string;
}

export interface QuotePartnerOpinionSnapshot extends SaveQuotePartnerOpinionPayload {
  id: string;
  status: QuoteDraftStatus;
  step: typeof QuoteDraftStep.PARTNER_OPINION | "partner_opinion";
  completedAt: string;
  updatedAt: string;
}

export interface QuoteGuarantorAddressPayload {
  zipCode: string;
  streetName: string;
  streetNumber: string;
  streetComplement?: string;
  streetDistrict: string;
  city: string;
  state: string;
}

export interface SaveQuoteGuarantorPayload {
  name: string;
  document: string;
  birthDate: string;
  email: string;
  telephone: string;
  address: QuoteGuarantorAddressPayload;
  relationship: GuarantorRelationship;
}

export interface QuoteGuarantorSnapshot extends SaveQuoteGuarantorPayload {
  id: string;
  status: QuoteDraftStatus;
  step: typeof QuoteDraftStep.GUARANTOR | "guarantor";
  completedAt: string;
  updatedAt: string;
}

export interface QuoteExpensePayload {
  category: ExpenseCategory;
  amount: number;
  description?: string;
}

export interface QuoteLoanPayload {
  installmentAmount: number;
  frequency: LoanFrequency;
  institution: LoanInstitution;
  category: LoanCategory;
  description?: string;
}

export interface SaveQuoteFinancialPayload {
  expenses: QuoteExpensePayload[];
  loans: QuoteLoanPayload[];
}

export interface QuoteFinancialSnapshot extends SaveQuoteFinancialPayload {
  id: string;
  status: QuoteDraftStatus;
  step: typeof QuoteDraftStep.FINANCIAL | "financial";
  completedAt: string;
  updatedAt: string;
}

export interface QuoteStatusResponse {
  id: string;
  status: QuoteStatus;
  updatedAt: string;
}

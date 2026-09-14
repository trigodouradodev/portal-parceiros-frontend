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
  IncomeProofType,
  IncomeSource,
  LoanCategory,
  LoanFrequency,
  LoanInstitution,
  MaritalStatus,
  PartnerAssessment,
  QuoteAttachmentType,
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

export interface QuoteAttachmentSnapshot {
  id: string;
  attachmentType: QuoteAttachmentType;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
  incomeProofType?: IncomeProofType;
  signedUrl?: string;
}

export interface QuoteDocumentationAttachments {
  identificationDocuments: QuoteAttachmentSnapshot[];
  proofOfResidence: QuoteAttachmentSnapshot[];
  activityPhotos: QuoteAttachmentSnapshot[];
  proofOfIncome: QuoteAttachmentSnapshot[];
}

export interface QuoteDocumentationSnapshot extends QuoteDocumentationAttachments {
  id: string;
  status: QuoteDraftStatus;
  step: typeof QuoteDraftStep.DOCUMENTATION | "documentation";
  completedAt: string;
  updatedAt: string;
}

export interface UploadQuoteAttachmentInput {
  attachmentType: QuoteAttachmentType;
  incomeProofType?: IncomeProofType;
  file: File;
}

export interface QuoteStatusResponse {
  id: string;
  status: QuoteStatus;
  updatedAt: string;
}

export interface QuoteConsultantSummary {
  id: string;
  name: string;
}

export interface QuoteListItem {
  id: string;
  simulationId: string | null;
  status: string;
  name: string;
  document: string;
  productId: string;
  productName: string;
  financeAmount: number;
  consultant: QuoteConsultantSummary;
  completedSteps: QuoteDraftStep[];
  canEdit: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface QuotesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface QuotesPage {
  items: QuoteListItem[];
  pagination: QuotesPagination;
}

export interface ListQuotesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface QuoteRegistrationDetail {
  isRenegotiation: boolean;
  gender: Gender | null;
  secondaryDocument: string | null;
  profession: string;
  economicActivityCategories: EconomicActivityCategory[];
  economicActivityOther: string | null;
  maritalStatus: MaritalStatus | null;
  spouseDocument: string | null;
  childrenCount: number | null;
  householdMembers: number | null;
  housingStatus: HousingStatus | null;
  residenceDuration: ResidenceDuration | null;
  governmentPrograms: GovernmentProgram[];
  ownsVehicle: boolean | null;
  vehicleFinanced: boolean | null;
  creditPurpose: CreditPurpose | null;
}

export interface QuoteIncomeDetail {
  businessDocument: string | null;
  activityDuration: ActivityDuration | null;
  declaredMonthlyIncome: number;
  incomeSource: IncomeSource | null;
  hasMultipleIncomeSources: boolean | null;
  secondaryIncome: number | null;
  availableIncomeProof: AvailableIncomeProof | null;
}

export interface QuoteAddressDetail {
  zipCode: string;
  streetName: string;
  streetNumber: string;
  streetComplement: string;
  streetDistrict: string;
  city: string;
  state: string | null;
  referencePoint: string | null;
  geolocation: {
    latitude: number;
    longitude: number;
    precision: string;
  } | null;
}

export interface QuotePartnerOpinionDetail {
  relationshipDuration: CustomerRelationshipDuration | null;
  relationshipOrigin: CustomerRelationshipOrigin | null;
  relationshipOriginOther: string | null;
  referrerDocument: string | null;
  assessment: PartnerAssessment | null;
  hasInformalDebtSigns: boolean | null;
  hasFinancialUrgencySigns: boolean | null;
  opinion: string | null;
}

export interface QuoteGuarantorDetail {
  name: string;
  document: string;
  birthDate: string;
  email: string;
  telephone: string;
  address: {
    zipCode: string;
    streetName: string;
    streetNumber: string;
    streetComplement: string;
    streetDistrict: string;
    city: string;
    state: string | null;
  };
  relationship: GuarantorRelationship | null;
}

export interface QuoteFinancialDetail {
  expenses: QuoteExpensePayload[];
  loans: QuoteLoanPayload[];
}

export interface QuoteAttachmentListItem {
  id: string;
  attachmentType: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
  incomeProofType?: string;
  signedUrl?: string;
}

export interface QuoteDocumentationDetail {
  identificationDocuments: QuoteAttachmentListItem[];
  proofOfResidence: QuoteAttachmentListItem[];
  activityPhotos: QuoteAttachmentListItem[];
  proofOfIncome: QuoteAttachmentListItem[];
}

export interface QuoteDetail extends QuoteListItem {
  partyId: string | null;
  birthDate: string | null;
  email: string;
  telephone: string;
  interestRate: number | null;
  installmentNumbers: number;
  firstInstallmentDate: string;
  installmentAmount: number | null;
  totalAmountOwed: number | null;
  registration: QuoteRegistrationDetail;
  income: QuoteIncomeDetail;
  address: QuoteAddressDetail;
  partnerOpinion: QuotePartnerOpinionDetail;
  guarantor: QuoteGuarantorDetail | null;
  financial: QuoteFinancialDetail;
  documentation: QuoteDocumentationDetail;
}

/** Códigos estáveis alinhados a portal-parceiros-backend/src/quotes/enums. */

export const QuoteStatus = {
  DRAFT: "draft",
  CLIENT_REVIEW: "client_review",
  KYC_ANALYSIS: "kyc_analysis",
} as const;
export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const QuoteDraftStep = {
  REGISTRATION: "registration",
  INCOME: "income",
  ADDRESS: "address",
  PARTNER_OPINION: "partner_opinion",
  GUARANTOR: "guarantor",
} as const;
export type QuoteDraftStep =
  (typeof QuoteDraftStep)[keyof typeof QuoteDraftStep];

export const Gender = {
  MALE: "male",
  FEMALE: "female",
  NOT_INFORMED: "not_informed",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const EconomicActivityCategory = {
  RETIRED_OR_PENSIONER: "retired_or_pensioner",
  PUBLIC_SERVANT: "public_servant",
  CLT_EMPLOYEE: "clt_employee",
  BUSINESS_OWNER: "business_owner",
  SELF_EMPLOYED_OR_INFORMAL: "self_employed_or_informal",
  UNEMPLOYED: "unemployed",
  OTHER: "other",
} as const;
export type EconomicActivityCategory =
  (typeof EconomicActivityCategory)[keyof typeof EconomicActivityCategory];

export const MaritalStatus = {
  SINGLE: "single",
  MARRIED: "married",
  STABLE_UNION: "stable_union",
  DIVORCED: "divorced",
  WIDOWED: "widowed",
} as const;
export type MaritalStatus =
  (typeof MaritalStatus)[keyof typeof MaritalStatus];

export const HousingStatus = {
  OWNED_PAID_OFF: "owned_paid_off",
  OWNED_FINANCED: "owned_financed",
  RENTED: "rented",
  CEDED: "ceded",
} as const;
export type HousingStatus =
  (typeof HousingStatus)[keyof typeof HousingStatus];

export const ResidenceDuration = {
  LESS_THAN_6_MONTHS: "less_than_6_months",
  SIX_MONTHS_TO_2_YEARS: "6_months_to_2_years",
  TWO_TO_5_YEARS: "2_to_5_years",
  MORE_THAN_5_YEARS: "more_than_5_years",
} as const;
export type ResidenceDuration =
  (typeof ResidenceDuration)[keyof typeof ResidenceDuration];

export const GovernmentProgram = {
  NONE: "none",
  BOLSA_FAMILIA: "bolsa_familia",
  BPC: "bpc",
  OTHER: "other",
} as const;
export type GovernmentProgram =
  (typeof GovernmentProgram)[keyof typeof GovernmentProgram];

export const CreditPurpose = {
  BUSINESS_WORKING_CAPITAL: "business_working_capital",
  INVENTORY_PURCHASE: "inventory_purchase",
  WORK_EQUIPMENT_OR_VEHICLE: "work_equipment_or_vehicle",
  RENOVATION_OR_CONSTRUCTION: "renovation_or_construction",
  NEW_BUSINESS: "new_business",
  DEBT_PAYOFF_OR_REFINANCING: "debt_payoff_or_refinancing",
  PERSONAL_EXPENSE: "personal_expense",
  HEALTH: "health",
  EDUCATION: "education",
  OTHER: "other",
} as const;
export type CreditPurpose =
  (typeof CreditPurpose)[keyof typeof CreditPurpose];

export const ActivityDuration = {
  LESS_THAN_6_MONTHS: "less_than_6_months",
  SIX_MONTHS_TO_1_YEAR: "6_months_to_1_year",
  ONE_TO_3_YEARS: "1_to_3_years",
  THREE_TO_5_YEARS: "3_to_5_years",
  MORE_THAN_5_YEARS: "more_than_5_years",
} as const;
export type ActivityDuration =
  (typeof ActivityDuration)[keyof typeof ActivityDuration];

export const IncomeSource = {
  SALARY: "salary",
  OWN_BUSINESS: "own_business",
  BENEFIT: "benefit",
  RENT: "rent",
  MIXED_INCOME: "mixed_income",
} as const;
export type IncomeSource = (typeof IncomeSource)[keyof typeof IncomeSource];

export const AvailableIncomeProof = {
  PAYSLIP: "payslip",
  BANK_STATEMENT: "bank_statement",
  DAS_MEI: "das_mei",
  INSS_BENEFIT: "inss_benefit",
  NONE: "none",
} as const;
export type AvailableIncomeProof =
  (typeof AvailableIncomeProof)[keyof typeof AvailableIncomeProof];

export const CustomerRelationshipDuration = {
  JUST_MET: "just_met",
  LESS_THAN_1_YEAR: "less_than_1_year",
  ONE_TO_3_YEARS: "1_to_3_years",
  MORE_THAN_3_YEARS: "more_than_3_years",
} as const;
export type CustomerRelationshipDuration =
  (typeof CustomerRelationshipDuration)[keyof typeof CustomerRelationshipDuration];

export const CustomerRelationshipOrigin = {
  PREVIOUS_CUSTOMER: "previous_customer",
  AUREA_CUSTOMER_REFERRAL: "aurea_customer_referral",
  THIRD_PARTY_REFERRAL: "third_party_referral",
  IN_PERSON_PROSPECTING: "in_person_prospecting",
  INBOUND_CUSTOMER: "inbound_customer",
  SOCIAL_MEDIA_OR_WHATSAPP: "social_media_or_whatsapp",
  CONSULTANT_RELATIVE_OR_FRIEND: "consultant_relative_or_friend",
  OTHER: "other",
} as const;
export type CustomerRelationshipOrigin =
  (typeof CustomerRelationshipOrigin)[keyof typeof CustomerRelationshipOrigin];

export const PartnerAssessment = {
  STRONGLY_RECOMMEND: "strongly_recommend",
  RECOMMEND: "recommend",
  HAVE_DOUBTS: "have_doubts",
  DO_NOT_RECOMMEND: "do_not_recommend",
} as const;
export type PartnerAssessment =
  (typeof PartnerAssessment)[keyof typeof PartnerAssessment];

export const GuarantorRelationship = {
  PARENT: "parent",
  SPOUSE: "spouse",
  SIBLING: "sibling",
  CHILD: "child",
  OTHER_RELATIVE: "other_relative",
  UNRELATED: "unrelated",
} as const;
export type GuarantorRelationship =
  (typeof GuarantorRelationship)[keyof typeof GuarantorRelationship];

/** Enums do passo Financeiro (branch BE ainda não mergeada em dev). */
export const ExpenseCategory = {
  HOUSING_OR_RENT: "housing_or_rent",
  SCHOOL_OR_DAYCARE: "school_or_daycare",
  MEDICINE_OR_HEALTH: "medicine_or_health",
  HOUSEHOLD_EXPENSES: "household_expenses",
  LEISURE: "leisure",
  SAVINGS_GROUP_OR_CONSORTIUM: "savings_group_or_consortium",
  CREDIT_CARD: "credit_card",
  OTHER: "other",
} as const;
export type ExpenseCategory =
  (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const LoanInstitution = {
  ITAU: "itau",
  SANTANDER: "santander",
  CREDIAMIGO: "crediamigo",
  CAIXA: "caixa",
  NUBANK: "nubank",
  OTHER: "other",
  LOAN_SHARK: "loan_shark",
} as const;
export type LoanInstitution =
  (typeof LoanInstitution)[keyof typeof LoanInstitution];

export const LoanFrequency = {
  MONTHLY: "monthly",
  BIWEEKLY: "biweekly",
  WEEKLY: "weekly",
  DAILY: "daily",
} as const;
export type LoanFrequency =
  (typeof LoanFrequency)[keyof typeof LoanFrequency];

export const LoanCategory = {
  CREDIT_CARD: "credit_card",
  OVERDRAFT: "overdraft",
  SAVINGS_GROUP_OR_CONSORTIUM: "savings_group_or_consortium",
  LOAN_SHARK: "loan_shark",
  OTHER: "other",
} as const;
export type LoanCategory = (typeof LoanCategory)[keyof typeof LoanCategory];

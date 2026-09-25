/**
 * Ciclo de vida da quote na tabela compartilhada com o backoffice.
 * O portal só escreve `draft` e `client_review`; os demais chegam na listagem
 * depois da revisão do cliente.
 */
export const QuoteStatus = {
  DRAFT: "draft",
  CLIENT_REVIEW: "client_review",
  KYC_ANALYSIS: "kyc_analysis",
  PENDING: "pending",
  IN_ANALYSIS: "em_analise",
  PENDING_CORRECTION: "pending_correction",
  PRE_APPROVED: "pre_approved",
  APPROVED: "approved",
  AUTO_REJECTED: "auto_rejected",
  REJECTED: "rejected",
  FAILED: "failed",
} as const;
export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

const QUOTE_STATUS_VALUES = new Set<string>(Object.values(QuoteStatus));

export function isQuoteStatus(status: string): status is QuoteStatus {
  return QUOTE_STATUS_VALUES.has(status);
}

export const QuoteDraftStep = {
  REGISTRATION: "registration",
  INCOME: "income",
  ADDRESS: "address",
  PARTNER_OPINION: "partner_opinion",
  GUARANTOR: "guarantor",
  FINANCIAL: "financial",
  DOCUMENTATION: "documentation",
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

/**
 * Ramo de atividade do cliente (AUREA-XXX). Taxonomia alinhada com
 * `analytics.vw_dim_cliente_ocupacao.subgrupo_ocupacional`.
 */
export const BusinessActivityBranch = {
  RETAIL_COMMERCE: "retail_commerce",
  FOOD: "food",
  AGRICULTURE_RURAL: "agriculture_rural",
  CONSTRUCTION: "construction",
  TRANSPORTATION: "transportation",
  HEALTH_AND_CARE: "health_and_care",
  EDUCATION: "education",
  BEAUTY_AND_AESTHETICS: "beauty_and_aesthetics",
  AUTOMOTIVE: "automotive",
  INDUSTRY_AND_LOGISTICS: "industry_and_logistics",
  DOMESTIC_SERVICES: "domestic_services",
  SECURITY: "security",
  ADMINISTRATIVE_OFFICE: "administrative_office",
} as const;
export type BusinessActivityBranch =
  (typeof BusinessActivityBranch)[keyof typeof BusinessActivityBranch];

/**
 * Subcategoria de atividade — desambigua dentro de cada `BusinessActivityBranch`
 * (ex.: "Construção Civil" → pedreiro vs. eletricista vs. empreiteiro), com
 * valor sempre exigido junto do ramo. Taxonomia baseada na CNAE (IBGE/Receita
 * Federal) e na lista de atividades permitidas para MEI (CGSIM), adaptada
 * para linguagem de negócio. `OTHER` é o valor de escape comum a todo ramo.
 */
export const BusinessActivitySubcategory = {
  // Comércio / Varejo
  CLOTHING_AND_FASHION: "clothing_and_fashion",
  COSMETICS_AND_PERFUMERY: "cosmetics_and_perfumery",
  FOOD_AND_BEVERAGE_COMMERCE: "food_and_beverage_commerce",
  STREET_VENDING: "street_vending",
  BEVERAGE_DISTRIBUTOR: "beverage_distributor",
  GENERAL_COMMERCE: "general_commerce",

  // Alimentação
  RESTAURANT_OR_SNACK_BAR: "restaurant_or_snack_bar",
  BAKERY_OR_CONFECTIONERY: "bakery_or_confectionery",
  HOME_MEALS_OR_CATERING: "home_meals_or_catering",
  FOOD_TRUCK_OR_STREET_FOOD: "food_truck_or_street_food",
  EVENTS_CATERING: "events_catering",

  // Agro / Rural
  CROP_FARMING: "crop_farming",
  LIVESTOCK: "livestock",
  POULTRY_OR_SWINE: "poultry_or_swine",
  FISHING_OR_AQUACULTURE: "fishing_or_aquaculture",

  // Construção Civil
  BRICKLAYER_OR_LABORER: "bricklayer_or_laborer",
  ELECTRICIAN_OR_PLUMBER: "electrician_or_plumber",
  SMALL_CONTRACTOR: "small_contractor",
  PAINTER: "painter",
  CARPENTRY_OR_MASONRY_WORK: "carpentry_or_masonry_work",

  // Transporte
  APP_DRIVER: "app_driver",
  TAXI_DRIVER: "taxi_driver",
  DELIVERY_OR_MOTORCYCLE_COURIER: "delivery_or_motorcycle_courier",
  FREIGHT_TRANSPORT: "freight_transport",
  SCHOOL_OR_CHARTER_TRANSPORT: "school_or_charter_transport",

  // Saúde e Cuidados
  ELDERLY_OR_HOME_CAREGIVER: "elderly_or_home_caregiver",
  NURSING_TECHNICIAN: "nursing_technician",
  THERAPIST_OR_PHYSIOTHERAPIST: "therapist_or_physiotherapist",
  DOMESTIC_CARE_WORKER: "domestic_care_worker",

  // Educação
  PRIVATE_TUTOR: "private_tutor",
  DAYCARE_OR_SMALL_SCHOOL: "daycare_or_small_school",
  LANGUAGE_OR_VOCATIONAL_COURSE: "language_or_vocational_course",

  // Beleza e Estética
  HAIR_SALON_OR_BARBERSHOP: "hair_salon_or_barbershop",
  MANICURE_OR_PEDICURE: "manicure_or_pedicure",
  MOBILE_HAIRDRESSER: "mobile_hairdresser",
  MAKEUP_OR_EYEBROW_DESIGN: "makeup_or_eyebrow_design",
  BODY_AESTHETICS_CLINIC: "body_aesthetics_clinic",

  // Automotivo
  AUTO_REPAIR_SHOP: "auto_repair_shop",
  AUTO_PARTS: "auto_parts",
  CAR_WASH_OR_DETAILING: "car_wash_or_detailing",
  BODY_SHOP_OR_PAINT: "body_shop_or_paint",

  // Indústria / Logística
  SMALL_MANUFACTURING: "small_manufacturing",
  GARMENT_OR_SEWING_PRODUCTION: "garment_or_sewing_production",
  CARPENTRY_OR_METALWORK_PRODUCTION: "carpentry_or_metalwork_production",
  WAREHOUSING_OR_LOGISTICS: "warehousing_or_logistics",

  // Serviços Domésticos
  DAY_LABORER_CLEANING: "day_laborer_cleaning",
  LIVE_IN_OR_MONTHLY_HOUSEKEEPER: "live_in_or_monthly_housekeeper",
  LAUNDRY_OR_IRONING: "laundry_or_ironing",
  CLEANING_TEAM_OR_COMPANY: "cleaning_team_or_company",

  // Segurança
  SECURITY_GUARD_EMPLOYEE: "security_guard_employee",
  FREELANCE_SECURITY: "freelance_security",
  SECURITY_COMPANY_OWNER: "security_company_owner",

  // Administrativo / Escritório
  FREELANCE_ADMIN_ASSISTANT: "freelance_admin_assistant",
  ACCOUNTING_OFFICE: "accounting_office",
  VIRTUAL_ASSISTANT_OR_FREELANCER: "virtual_assistant_or_freelancer",
  REAL_ESTATE_OR_INSURANCE_BROKER: "real_estate_or_insurance_broker",

  // Comum a qualquer ramo
  OTHER: "other",
} as const;
export type BusinessActivitySubcategory =
  (typeof BusinessActivitySubcategory)[keyof typeof BusinessActivitySubcategory];

export const MaritalStatus = {
  SINGLE: "single",
  MARRIED: "married",
  STABLE_UNION: "stable_union",
  DIVORCED: "divorced",
  WIDOWED: "widowed",
} as const;
export type MaritalStatus = (typeof MaritalStatus)[keyof typeof MaritalStatus];

export const HousingStatus = {
  OWNED_PAID_OFF: "owned_paid_off",
  OWNED_FINANCED: "owned_financed",
  RENTED: "rented",
  CEDED: "ceded",
} as const;
export type HousingStatus = (typeof HousingStatus)[keyof typeof HousingStatus];

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
export type CreditPurpose = (typeof CreditPurpose)[keyof typeof CreditPurpose];

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
  FAMILY_INCOME: "family_income",
  OTHER: "other",
} as const;
export type IncomeSource = (typeof IncomeSource)[keyof typeof IncomeSource];

export const IncomeEntryRole = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
} as const;
export type IncomeEntryRole =
  (typeof IncomeEntryRole)[keyof typeof IncomeEntryRole];

export const FamilyRelationship = {
  SPOUSE: "spouse",
  FATHER: "father",
  MOTHER: "mother",
  CHILD: "child",
  SIBLING: "sibling",
  OTHER_RELATIVE: "other_relative",
} as const;
export type FamilyRelationship =
  (typeof FamilyRelationship)[keyof typeof FamilyRelationship];

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

export const QuoteAttachmentType = {
  IDENTIFICATION_DOCUMENT: "identification_document",
  PROOF_OF_RESIDENCE: "proof_of_residence",
  ACTIVITY_PHOTO: "activity_photo",
  PROOF_OF_INCOME: "proof_of_income",
} as const;
export type QuoteAttachmentType =
  (typeof QuoteAttachmentType)[keyof typeof QuoteAttachmentType];

export const IncomeProofType = {
  BANK_STATEMENT: "bank_statement",
  PAYSLIP: "payslip",
  INSS_BENEFIT: "inss_benefit",
  MEI_DAS: "mei_das",
} as const;
export type IncomeProofType =
  (typeof IncomeProofType)[keyof typeof IncomeProofType];

/** Enums do passo Financeiro. */
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
export type LoanFrequency = (typeof LoanFrequency)[keyof typeof LoanFrequency];

export const LoanCategory = {
  CREDIT_CARD: "credit_card",
  OVERDRAFT: "overdraft",
  SAVINGS_GROUP_OR_CONSORTIUM: "savings_group_or_consortium",
  LOAN_SHARK: "loan_shark",
  MICROCREDIT: "microcredit",
  OTHER: "other",
} as const;
export type LoanCategory = (typeof LoanCategory)[keyof typeof LoanCategory];

/** Contrato compartilhado com o backoffice (`quotes.payment_pix_type`). */
export const PaymentPixType = {
  CPF: "CPF",
  TELEPHONE: "TELEPHONE",
  EMAIL: "EMAIL",
  RANDOM_KEY: "RANDOM_KEY",
} as const;
export type PaymentPixType =
  (typeof PaymentPixType)[keyof typeof PaymentPixType];

/** Status persistido em GET /simulations e no draft de GET/POST /quotes. */
export type QuoteDraftStatus = "draft";

/** Draft recém-criado por POST /quotes/draft. */
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
}

export interface CreateDraftQuotePayload {
  simulationId: string;
}

export type QuoteGender = "male" | "female" | "not_informed";

export type QuoteEconomicActivityCategory =
  | "retired_or_pensioner"
  | "public_servant"
  | "clt_employee"
  | "business_owner"
  | "self_employed_or_informal"
  | "unemployed"
  | "other";

export type QuoteMaritalStatus =
  | "single"
  | "married"
  | "stable_union"
  | "divorced"
  | "widowed";

export type QuoteHousingStatus =
  | "owned_paid_off"
  | "owned_financed"
  | "rented"
  | "ceded";

export type QuoteResidenceDuration =
  | "less_than_6_months"
  | "6_months_to_2_years"
  | "2_to_5_years"
  | "more_than_5_years";

export type QuoteGovernmentProgram = "none" | "bolsa_familia" | "bpc" | "other";

export type QuoteCreditPurpose =
  | "business_working_capital"
  | "inventory_purchase"
  | "work_equipment_or_vehicle"
  | "renovation_or_construction"
  | "new_business"
  | "debt_payoff_or_refinancing"
  | "personal_expense"
  | "health"
  | "education"
  | "other";

/** Body de PATCH /quotes/draft/:quoteId/registration. */
export interface SaveQuoteRegistrationPayload {
  isRenegotiation: boolean;
  gender: QuoteGender;
  secondaryDocument: string;
  profession: string;
  economicActivityCategories: QuoteEconomicActivityCategory[];
  economicActivityOther?: string;
  maritalStatus: QuoteMaritalStatus;
  spouseDocument?: string;
  childrenCount: number;
  householdMembers: number;
  housingStatus: QuoteHousingStatus;
  residenceDuration: QuoteResidenceDuration;
  governmentPrograms: QuoteGovernmentProgram[];
  ownsVehicle: boolean;
  vehicleFinanced?: boolean;
  creditPurpose: QuoteCreditPurpose;
}

export interface QuoteRegistrationSnapshot extends SaveQuoteRegistrationPayload {
  id: string;
  status: QuoteDraftStatus;
  step: "registration";
  completedAt: string;
  updatedAt: string;
}

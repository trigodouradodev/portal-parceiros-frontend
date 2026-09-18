import type { SelectOption } from "@/components/ui/select-option";
import { formatPartyTelephone } from "@/features/originacao/mappers/map-party-to-guarantor";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { digitsOnlyPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import {
  CreditPurpose,
  CustomerRelationshipOrigin,
  EconomicActivityCategory,
  GovernmentProgram,
  LoanInstitution,
  MaritalStatus,
  PartnerAssessment,
  QuoteStatus,
} from "@/services/quotes/quotes.enums";
import {
  ACTIVITY_CATEGORY_OPTIONS as QUOTE_ACTIVITY_CATEGORY_OPTIONS,
  ACTIVITY_TIME_OPTIONS as QUOTE_ACTIVITY_TIME_OPTIONS,
  CREDIT_PURPOSE_OPTIONS as QUOTE_CREDIT_PURPOSE_OPTIONS,
  CREDITOR_INSTITUTION_OPTIONS as QUOTE_CREDITOR_INSTITUTION_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS as QUOTE_EXPENSE_CATEGORY_OPTIONS,
  GENDER_OPTIONS as QUOTE_GENDER_OPTIONS,
  GOVERNMENT_PROGRAM_OPTIONS as QUOTE_GOVERNMENT_PROGRAM_OPTIONS,
  HOW_KNOWS_CLIENT_OPTIONS as QUOTE_HOW_KNOWS_CLIENT_OPTIONS,
  DOCUMENTATION_INCOME_PROOF_OPTIONS as QUOTE_DOCUMENTATION_INCOME_PROOF_OPTIONS,
  INCOME_PROOF_OPTIONS as QUOTE_INCOME_PROOF_OPTIONS,
  INCOME_SOURCE_OPTIONS as QUOTE_INCOME_SOURCE_OPTIONS,
  KINSHIP_OPTIONS as QUOTE_KINSHIP_OPTIONS,
  LOAN_CATEGORY_OPTIONS as QUOTE_LOAN_CATEGORY_OPTIONS,
  PAYMENT_PIX_OPTIONS as QUOTE_PAYMENT_PIX_OPTIONS,
  LOAN_FREQUENCY_OPTIONS as QUOTE_LOAN_FREQUENCY_OPTIONS,
  MARITAL_STATUS_OPTIONS as QUOTE_MARITAL_STATUS_OPTIONS,
  OVERALL_RATING_OPTIONS as QUOTE_OVERALL_RATING_OPTIONS,
  PROPERTY_STATUS_OPTIONS as QUOTE_PROPERTY_STATUS_OPTIONS,
  RELATIONSHIP_TIME_OPTIONS as QUOTE_RELATIONSHIP_TIME_OPTIONS,
  RESIDENCE_TIME_OPTIONS as QUOTE_RESIDENCE_TIME_OPTIONS,
} from "@/services/quotes/quotes.labels";

export const PROPOSAL_STEPS = [
  "Cadastro",
  "Atividade e Renda",
  "Endereço",
  "Parecer do Parceiro",
  "Avalista",
  "Financeiro",
  "Documentação",
] as const;

export const UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

/** Options com `value` = código estável do backend e `label` em PT. */
export const ACTIVITY_CATEGORY_OPTIONS: SelectOption[] =
  QUOTE_ACTIVITY_CATEGORY_OPTIONS;
export const CREDIT_PURPOSE_OPTIONS: SelectOption[] =
  QUOTE_CREDIT_PURPOSE_OPTIONS;
export const RESIDENCE_TIME_OPTIONS: SelectOption[] =
  QUOTE_RESIDENCE_TIME_OPTIONS;
export const PROPERTY_STATUS_OPTIONS: SelectOption[] =
  QUOTE_PROPERTY_STATUS_OPTIONS;
export const GOVERNMENT_PROGRAM_OPTIONS: SelectOption[] =
  QUOTE_GOVERNMENT_PROGRAM_OPTIONS;
export const GENDER_OPTIONS: SelectOption[] = QUOTE_GENDER_OPTIONS;
export const MARITAL_STATUS_OPTIONS: SelectOption[] =
  QUOTE_MARITAL_STATUS_OPTIONS;
export const ACTIVITY_TIME_OPTIONS: SelectOption[] =
  QUOTE_ACTIVITY_TIME_OPTIONS;
export const INCOME_SOURCE_OPTIONS: SelectOption[] =
  QUOTE_INCOME_SOURCE_OPTIONS;
export const INCOME_PROOF_OPTIONS: SelectOption[] = QUOTE_INCOME_PROOF_OPTIONS;
export const RELATIONSHIP_TIME_OPTIONS: SelectOption[] =
  QUOTE_RELATIONSHIP_TIME_OPTIONS;
export const HOW_KNOWS_CLIENT_OPTIONS: SelectOption[] =
  QUOTE_HOW_KNOWS_CLIENT_OPTIONS;
export const OVERALL_RATING_OPTIONS: SelectOption[] =
  QUOTE_OVERALL_RATING_OPTIONS;
export const EXPENSE_CATEGORY_OPTIONS: SelectOption[] =
  QUOTE_EXPENSE_CATEGORY_OPTIONS;
export const LOAN_FREQUENCY_OPTIONS: SelectOption[] =
  QUOTE_LOAN_FREQUENCY_OPTIONS;
export const CREDITOR_INSTITUTION_OPTIONS: SelectOption[] =
  QUOTE_CREDITOR_INSTITUTION_OPTIONS;
export const LOAN_CATEGORY_OPTIONS: SelectOption[] =
  QUOTE_LOAN_CATEGORY_OPTIONS;
export const PAYMENT_PIX_OPTIONS: SelectOption[] = QUOTE_PAYMENT_PIX_OPTIONS;
export const KINSHIP_OPTIONS: SelectOption[] = QUOTE_KINSHIP_OPTIONS;

export const CHILDREN_COUNT_MAX = 5;
export const HOUSEHOLD_SIZE_MIN = 1;
export const HOUSEHOLD_SIZE_MAX = 6;

/** Select AUREA-512: o último valor representa "N ou mais". */
export const CHILDREN_COUNT_OPTIONS: SelectOption[] = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5 ou mais" },
];

export const HOUSEHOLD_SIZE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6 ou mais" },
];

export function clampCountSelect(
  value: number | null | undefined,
  min: number,
  max: number,
): string {
  if (value == null || Number.isNaN(value)) return "";
  return String(Math.min(max, Math.max(min, Math.trunc(value))));
}

/** Credor de dívida do passo Cadastro — campo só de UI (não vai no PATCH registration). */
export const DEBT_CREDITOR_OPTIONS = [
  "Banco",
  "Cartão de crédito",
  "Agiota",
  "Caixinha",
];

export const INCOME_DOCUMENT_TYPE_OPTIONS: SelectOption[] =
  QUOTE_DOCUMENTATION_INCOME_PROOF_OPTIONS;

export const DEBT_PURPOSE = CreditPurpose.DEBT_PAYOFF_OR_REFINANCING;
export const OTHER_OPTION = EconomicActivityCategory.OTHER;
export const NONE_PROGRAM = GovernmentProgram.NONE;
export const HOW_KNOWS_OTHER = CustomerRelationshipOrigin.OTHER;
export const AUREA_REFERRAL_OPTION =
  CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL;
export const DOUBTS_RATING = PartnerAssessment.HAVE_DOUBTS;
export const AGIOTA_CREDITOR = LoanInstitution.LOAN_SHARK;
export const MARRIED_STATUSES = [
  MaritalStatus.MARRIED,
  MaritalStatus.STABLE_UNION,
] as const;

export interface RegistrationData {
  isRenewal: boolean | null;
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  gender: string;
  rg: string;
  occupation: string;
  activityCategories: string[];
  activityCategoryOther: string;
  maritalStatus: string;
  spouseCpf: string;
  childrenCount: string;
  householdSize: string;
  propertyStatus: string;
  residenceTime: string;
  governmentPrograms: string[];
  hasVehicle: boolean | null;
  vehicleFinanced: boolean | null;
  creditPurpose: string | null;
  debtDescription: string;
  debtCreditor: string;
}

export interface ActivityIncomeData {
  cnpj: string;
  activityTime: string;
  monthlyIncome: string;
  incomeSource: string;
  hasMultipleSources: boolean | null;
  secondaryIncome: string;
  availableProof: string;
}

export interface AddressValue {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressGeolocation {
  latitude: number;
  longitude: number;
  precision: string;
}

export interface AddressData extends AddressValue {
  landmark: string;
  /** Preenchido só após captura via geolocalização; opcional no PATCH. */
  geolocation?: AddressGeolocation | null;
}

export interface PartnerOpinionData {
  relationshipTime: string;
  howKnows: string;
  howKnowsOther: string;
  referrerCpf: string;
  overallRating: string;
  informalDebtSigns: boolean | null;
  financialUrgencySigns: boolean | null;
  notes: string;
}

export interface GuarantorData extends AddressValue {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  kinship: string;
}

export interface ExpenseItem {
  id: number;
  category: string;
  amount: string;
  description: string;
}

export interface LoanItem {
  id: number;
  installmentAmount: string;
  frequency: string;
  institution: string;
  category: string;
  description: string;
}

export interface FinancialData {
  expenses: ExpenseItem[];
  loans: LoanItem[];
  nextId: number;
  paymentPixType: string;
  paymentPixCode: string;
}

export interface DocumentAttachmentItem {
  id: string;
  filename: string;
  incomeProofType?: string;
}

export interface DocumentsData {
  identification: DocumentAttachmentItem[];
  proofOfResidence: DocumentAttachmentItem[];
  activityPhotos: DocumentAttachmentItem[];
  incomeProofTypes: string[];
  incomeProofs: DocumentAttachmentItem[];
}

export interface ProposalFormData {
  registration: RegistrationData;
  activityIncome: ActivityIncomeData;
  address: AddressData;
  partnerOpinion: PartnerOpinionData;
  guarantor: GuarantorData;
  financial: FinancialData;
  documents: DocumentsData;
}

export interface ProposalSnapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Status da API (`draft`, `client_review`, `kyc_analysis`, …). */
  status: QuoteStatus;
  /** Indica se o usuário autenticado pode editar (API `canEdit`). */
  canEdit: boolean;
  simulation: SimulationSnapshot;
  step: number;
  stepValid: boolean[];
  data: ProposalFormData;
}

const EMPTY_ADDRESS: AddressValue = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export function createEmptyProposalForm(): ProposalFormData {
  return {
    registration: {
      isRenewal: null,
      name: "",
      cpf: "",
      birthDate: "",
      email: "",
      phone: "",
      gender: "",
      rg: "",
      occupation: "",
      activityCategories: [],
      activityCategoryOther: "",
      maritalStatus: "",
      spouseCpf: "",
      childrenCount: "",
      householdSize: "",
      propertyStatus: "",
      residenceTime: "",
      governmentPrograms: [GovernmentProgram.NONE],
      hasVehicle: null,
      vehicleFinanced: null,
      creditPurpose: null,
      debtDescription: "",
      debtCreditor: "",
    },
    activityIncome: {
      cnpj: "",
      activityTime: "",
      monthlyIncome: "",
      incomeSource: "",
      hasMultipleSources: null,
      secondaryIncome: "",
      availableProof: "",
    },
    address: {
      ...EMPTY_ADDRESS,
      landmark: "",
      geolocation: null,
    },
    partnerOpinion: {
      relationshipTime: "",
      howKnows: "",
      howKnowsOther: "",
      referrerCpf: "",
      overallRating: "",
      informalDebtSigns: null,
      financialUrgencySigns: null,
      notes: "",
    },
    guarantor: {
      name: "",
      cpf: "",
      birthDate: "",
      email: "",
      phone: "",
      ...EMPTY_ADDRESS,
      kinship: "",
    },
    financial: {
      expenses: [],
      loans: [],
      nextId: 1,
      paymentPixType: "",
      paymentPixCode: "",
    },
    documents: {
      identification: [],
      proofOfResidence: [],
      activityPhotos: [],
      incomeProofTypes: [],
      incomeProofs: [],
    },
  };
}

export function registrationIdentityFromSimulation(
  simulation: SimulationSnapshot,
): Pick<RegistrationData, "name" | "cpf" | "birthDate" | "email" | "phone"> {
  return {
    name: simulation.name,
    cpf: formatCpf(simulation.document),
    birthDate: simulation.birthDate,
    email: simulation.email,
    phone: formatPartyTelephone(simulation.telephone),
  };
}

export function applyRegistrationIdentityToSimulation(
  simulation: SimulationSnapshot,
  registration: RegistrationData,
): SimulationSnapshot {
  return {
    ...simulation,
    name: registration.name.trim(),
    document: registration.cpf.replace(/\D/g, ""),
    birthDate: registration.birthDate.trim(),
    email: registration.email.trim(),
    telephone: digitsOnlyPhone(registration.phone),
  };
}

export function createProposalFromSimulation(
  simulation: SimulationSnapshot,
  quote: { id: string; createdAt: string },
): ProposalSnapshot {
  const createdAt = new Date(quote.createdAt).toLocaleString("pt-BR");
  const data = createEmptyProposalForm();
  return {
    id: quote.id,
    createdAt,
    updatedAt: createdAt,
    status: QuoteStatus.DRAFT,
    canEdit: true,
    simulation,
    step: 0,
    stepValid: Array(PROPOSAL_STEPS.length).fill(false),
    data: {
      ...data,
      registration: {
        ...data.registration,
        ...registrationIdentityFromSimulation(simulation),
      },
    },
  };
}

export function hasSpouse(maritalStatus: string): boolean {
  return (MARRIED_STATUSES as readonly string[]).includes(maritalStatus);
}

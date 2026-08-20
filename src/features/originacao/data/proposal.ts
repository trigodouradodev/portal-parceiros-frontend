import type { SimulacaoSnapshot } from "@/features/originacao/types";
import { calcAge, isAdultAge } from "@/features/originacao/utils/calc-age";
import { isCompleteCep } from "@/features/originacao/utils/format-cep";
import { isOptionalCpfValid, isValidCpf } from "@/lib/validation/cpf";

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

export const ACTIVITY_CATEGORY_OPTIONS = [
  "Aposentado/Pensionista",
  "Servidor Público",
  "Empregado CLT",
  "Empresário (CNPJ ativo)",
  "Autônomo/Informal (MEI)",
  "Sem ocupação remunerada/Desempregado",
  "Outros",
];

export const CREDIT_PURPOSE_OPTIONS = [
  "Fluxo de caixa do negócio",
  "Compra de mercadoria/estoque",
  "Equipamento/veículo de trabalho",
  "Reforma ou construção",
  "Abertura de novo negócio",
  "Quitação/troca de dívida",
  "Despesa pessoal",
  "Saúde",
  "Educação",
  "Outro",
];

export const DEBT_CREDITOR_OPTIONS = [
  "Banco",
  "Cartão de crédito",
  "Agiota",
  "Caixinha",
];

export const RESIDENCE_TIME_OPTIONS = [
  "Menos de 6 meses",
  "6 meses a 2 anos",
  "2 a 5 anos",
  "Mais de 5 anos",
];

export const PROPERTY_STATUS_OPTIONS = [
  "Próprio quitado",
  "Próprio financiado",
  "Alugado",
  "Cedido",
];

export const GOVERNMENT_PROGRAM_OPTIONS = [
  "Nenhum",
  "Bolsa Família",
  "BPC",
  "Outro",
];

export const GENDER_OPTIONS = ["Masculino", "Feminino", "Não informado"];

export const MARITAL_STATUS_OPTIONS = [
  "Solteiro(a)",
  "Casado(a)",
  "União estável",
  "Divorciado(a)",
  "Viúvo(a)",
];

export const ACTIVITY_TIME_OPTIONS = [
  "Menos de 6 meses",
  "6 meses a 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "Mais de 5 anos",
];

export const INCOME_SOURCE_OPTIONS = [
  "Salário",
  "Negócio próprio",
  "Benefício",
  "Aluguel",
  "Renda mista",
];

export const INCOME_PROOF_OPTIONS = [
  "Holerite",
  "Extrato bancário",
  "DAS-MEI",
  "Benefício INSS",
  "Nenhum",
];

export const RELATIONSHIP_TIME_OPTIONS = [
  "Conheci agora",
  "Menos de 1 ano",
  "1 a 3 anos",
  "Mais de 3 anos",
];

export const HOW_KNOWS_CLIENT_OPTIONS = [
  "Cliente antigo (já teve contrato)",
  "Indicação de cliente Áurea",
  "Indicação de terceiro (não cliente)",
  "Prospecção presencial",
  "Cliente me procurou espontaneamente",
  "Redes sociais ou WhatsApp",
  "Parente ou amigo do consultor",
  "Outro",
];

export const OVERALL_RATING_OPTIONS = [
  "Recomendo e confio fortemente",
  "Recomendo",
  "Tenho dúvidas",
  "Não recomendo",
];

export const EXPENSE_CATEGORY_OPTIONS = [
  "Aluguel/Moradia",
  "Escola/Creche",
  "Remédios/Saúde",
  "Despesas da casa",
  "Lazer",
  "Caixa financeiro/consórcio",
  "Cartão de crédito",
  "Outros",
];

export const LOAN_FREQUENCY_OPTIONS = [
  "Mensal",
  "Quinzenal",
  "Semanal",
  "Diária",
];

export const CREDITOR_INSTITUTION_OPTIONS = [
  "Itaú",
  "Santander",
  "CrediAmigo",
  "Caixa",
  "Nubank",
  "Outros",
  "Agiota",
];

export const LOAN_CATEGORY_OPTIONS = [
  "Cartão de crédito",
  "Cheque especial",
  "Caixa financeira/consórcio",
  "Agiota",
  "Outros",
];

export const KINSHIP_OPTIONS = [
  "Pai/Mãe",
  "Cônjuge",
  "Irmão/Irmã",
  "Filho(a)",
  "Outro parente",
  "Sem parentesco",
];

export const INCOME_DOCUMENT_TYPE_OPTIONS = [
  "Extrato bancário",
  "Holerite",
  "Benefício INSS",
  "MEI / DAS",
];

export const DEBT_PURPOSE = "Quitação/troca de dívida";
export const OTHER_OPTION = "Outros";
export const NONE_PROGRAM = "Nenhum";
export const HOW_KNOWS_OTHER = "Outro";
export const AUREA_REFERRAL_OPTION = "Indicação de cliente Áurea";
export const DOUBTS_RATING = "Tenho dúvidas";
export const AGIOTA_CREDITOR = "Agiota";
export const MARRIED_STATUSES = ["Casado(a)", "União estável"] as const;

export const CLIENT_MOCK_ADDRESS = {
  zipCode: "01001-000",
  street: "Rua das Flores",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
} as const;

export const GUARANTOR_MOCK_ADDRESS = {
  zipCode: "01310-100",
  street: "Avenida Paulista",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
} as const;

export interface RegistrationData {
  isRenewal: boolean | null;
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

export interface AddressData {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  landmark: string;
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

export interface GuarantorData {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
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
}

export interface DocumentsData {
  identification: string[];
  proofOfResidence: string[];
  activityPhotos: string[];
  incomeProofTypes: string[];
  incomeProofs: string[];
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

export type ProposalStatus = "draft" | "completed";

export interface ProposalSnapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ProposalStatus;
  simulation: SimulacaoSnapshot;
  step: number;
  stepValid: boolean[];
  data: ProposalFormData;
}

export function createEmptyProposalForm(): ProposalFormData {
  return {
    registration: {
      isRenewal: null,
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
      governmentPrograms: [],
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
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      landmark: "",
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
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      kinship: "",
    },
    financial: { expenses: [], loans: [], nextId: 1 },
    documents: {
      identification: [],
      proofOfResidence: [],
      activityPhotos: [],
      incomeProofTypes: [],
      incomeProofs: [],
    },
  };
}

export function toggleItem(list: string[], item: string): string[] {
  return list.includes(item)
    ? list.filter((entry) => entry !== item)
    : [...list, item];
}

export function createProposalFromSimulation(
  simulation: SimulacaoSnapshot,
): ProposalSnapshot {
  const now = new Date().toLocaleString("pt-BR");
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "draft",
    simulation,
    step: 0,
    stepValid: Array(PROPOSAL_STEPS.length).fill(false),
    data: createEmptyProposalForm(),
  };
}

export function hasSpouse(maritalStatus: string): boolean {
  return (MARRIED_STATUSES as readonly string[]).includes(maritalStatus);
}

export function isRegistrationValid(data: RegistrationData): boolean {
  return (
    data.isRenewal !== null &&
    data.gender !== "" &&
    data.occupation.trim() !== "" &&
    data.activityCategories.length > 0 &&
    data.creditPurpose !== null &&
    isOptionalCpfValid(data.spouseCpf)
  );
}

export function isActivityIncomeValid(data: ActivityIncomeData): boolean {
  return (
    data.activityTime !== "" &&
    data.monthlyIncome.trim() !== "" &&
    data.incomeSource !== "" &&
    data.availableProof !== ""
  );
}

export function isAddressValid(data: AddressData): boolean {
  return (
    isCompleteCep(data.zipCode) &&
    data.street.trim() !== "" &&
    data.number.trim() !== "" &&
    data.neighborhood.trim() !== "" &&
    data.city.trim() !== "" &&
    data.state !== ""
  );
}

export function isPartnerOpinionValid(data: PartnerOpinionData): boolean {
  return (
    data.relationshipTime !== "" &&
    data.howKnows !== "" &&
    data.overallRating !== "" &&
    data.informalDebtSigns !== null &&
    data.financialUrgencySigns !== null &&
    data.notes.trim() !== "" &&
    isOptionalCpfValid(data.referrerCpf)
  );
}

export function isGuarantorValid(data: GuarantorData): boolean {
  const age = calcAge(data.birthDate);
  return (
    data.name.trim() !== "" &&
    isValidCpf(data.cpf) &&
    isAdultAge(age) &&
    data.email.trim() !== "" &&
    data.phone.trim() !== "" &&
    isCompleteCep(data.zipCode) &&
    data.number.trim() !== "" &&
    data.neighborhood.trim() !== "" &&
    data.city.trim() !== "" &&
    data.state !== "" &&
    data.kinship !== ""
  );
}

export function isFinancialValid(): boolean {
  return true;
}

export function isDocumentsValid(data: DocumentsData): boolean {
  return (
    data.identification.length > 0 &&
    data.proofOfResidence.length > 0 &&
    data.activityPhotos.length > 0 &&
    data.incomeProofTypes.length > 0 &&
    data.incomeProofs.length > 0
  );
}

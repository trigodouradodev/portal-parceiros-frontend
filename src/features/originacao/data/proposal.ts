import type { SimulationSnapshot } from "@/features/originacao/types";

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

export interface AddressValue {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressData extends AddressValue {
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
      ...EMPTY_ADDRESS,
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
      ...EMPTY_ADDRESS,
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

export function createProposalFromSimulation(
  simulation: SimulationSnapshot,
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

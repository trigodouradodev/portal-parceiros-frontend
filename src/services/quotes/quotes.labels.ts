import type { SelectOption } from "@/components/ui/select-option";
import {
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
  ResidenceDuration,
} from "./quotes.enums";

function options(
  entries: ReadonlyArray<readonly [value: string, label: string]>,
): SelectOption[] {
  return entries.map(([value, label]) => ({ value, label }));
}

export const GENDER_OPTIONS = options([
  [Gender.MALE, "Masculino"],
  [Gender.FEMALE, "Feminino"],
  [Gender.NOT_INFORMED, "Não informado"],
]);

export const ACTIVITY_CATEGORY_OPTIONS = options([
  [EconomicActivityCategory.RETIRED_OR_PENSIONER, "Aposentado/Pensionista"],
  [EconomicActivityCategory.PUBLIC_SERVANT, "Servidor Público"],
  [EconomicActivityCategory.CLT_EMPLOYEE, "Empregado CLT"],
  [EconomicActivityCategory.BUSINESS_OWNER, "Empresário (CNPJ ativo)"],
  [
    EconomicActivityCategory.SELF_EMPLOYED_OR_INFORMAL,
    "Autônomo/Informal (MEI)",
  ],
  [
    EconomicActivityCategory.UNEMPLOYED,
    "Sem ocupação remunerada/Desempregado",
  ],
  [EconomicActivityCategory.OTHER, "Outros"],
]);

export const CREDIT_PURPOSE_OPTIONS = options([
  [CreditPurpose.BUSINESS_WORKING_CAPITAL, "Fluxo de caixa do negócio"],
  [CreditPurpose.INVENTORY_PURCHASE, "Compra de mercadoria/estoque"],
  [
    CreditPurpose.WORK_EQUIPMENT_OR_VEHICLE,
    "Equipamento/veículo de trabalho",
  ],
  [CreditPurpose.RENOVATION_OR_CONSTRUCTION, "Reforma ou construção"],
  [CreditPurpose.NEW_BUSINESS, "Abertura de novo negócio"],
  [CreditPurpose.DEBT_PAYOFF_OR_REFINANCING, "Quitação/troca de dívida"],
  [CreditPurpose.PERSONAL_EXPENSE, "Despesa pessoal"],
  [CreditPurpose.HEALTH, "Saúde"],
  [CreditPurpose.EDUCATION, "Educação"],
  [CreditPurpose.OTHER, "Outro"],
]);

export const RESIDENCE_TIME_OPTIONS = options([
  [ResidenceDuration.LESS_THAN_6_MONTHS, "Menos de 6 meses"],
  [ResidenceDuration.SIX_MONTHS_TO_2_YEARS, "6 meses a 2 anos"],
  [ResidenceDuration.TWO_TO_5_YEARS, "2 a 5 anos"],
  [ResidenceDuration.MORE_THAN_5_YEARS, "Mais de 5 anos"],
]);

export const PROPERTY_STATUS_OPTIONS = options([
  [HousingStatus.OWNED_PAID_OFF, "Próprio quitado"],
  [HousingStatus.OWNED_FINANCED, "Próprio financiado"],
  [HousingStatus.RENTED, "Alugado"],
  [HousingStatus.CEDED, "Cedido"],
]);

export const GOVERNMENT_PROGRAM_OPTIONS = options([
  [GovernmentProgram.NONE, "Nenhum"],
  [GovernmentProgram.BOLSA_FAMILIA, "Bolsa Família"],
  [GovernmentProgram.BPC, "BPC"],
  [GovernmentProgram.OTHER, "Outro"],
]);

export const MARITAL_STATUS_OPTIONS = options([
  [MaritalStatus.SINGLE, "Solteiro(a)"],
  [MaritalStatus.MARRIED, "Casado(a)"],
  [MaritalStatus.STABLE_UNION, "União estável"],
  [MaritalStatus.DIVORCED, "Divorciado(a)"],
  [MaritalStatus.WIDOWED, "Viúvo(a)"],
]);

export const ACTIVITY_TIME_OPTIONS = options([
  [ActivityDuration.LESS_THAN_6_MONTHS, "Menos de 6 meses"],
  [ActivityDuration.SIX_MONTHS_TO_1_YEAR, "6 meses a 1 ano"],
  [ActivityDuration.ONE_TO_3_YEARS, "1 a 3 anos"],
  [ActivityDuration.THREE_TO_5_YEARS, "3 a 5 anos"],
  [ActivityDuration.MORE_THAN_5_YEARS, "Mais de 5 anos"],
]);

export const INCOME_SOURCE_OPTIONS = options([
  [IncomeSource.SALARY, "Salário"],
  [IncomeSource.OWN_BUSINESS, "Negócio próprio"],
  [IncomeSource.BENEFIT, "Benefício"],
  [IncomeSource.RENT, "Aluguel"],
  [IncomeSource.MIXED_INCOME, "Renda mista"],
]);

export const INCOME_PROOF_OPTIONS = options([
  [AvailableIncomeProof.PAYSLIP, "Holerite"],
  [AvailableIncomeProof.BANK_STATEMENT, "Extrato bancário"],
  [AvailableIncomeProof.DAS_MEI, "DAS-MEI"],
  [AvailableIncomeProof.INSS_BENEFIT, "Benefício INSS"],
  [AvailableIncomeProof.NONE, "Nenhum"],
]);

export const RELATIONSHIP_TIME_OPTIONS = options([
  [CustomerRelationshipDuration.JUST_MET, "Conheci agora"],
  [CustomerRelationshipDuration.LESS_THAN_1_YEAR, "Menos de 1 ano"],
  [CustomerRelationshipDuration.ONE_TO_3_YEARS, "1 a 3 anos"],
  [CustomerRelationshipDuration.MORE_THAN_3_YEARS, "Mais de 3 anos"],
]);

export const HOW_KNOWS_CLIENT_OPTIONS = options([
  [CustomerRelationshipOrigin.PREVIOUS_CUSTOMER, "Cliente antigo (já teve contrato)"],
  [
    CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
    "Indicação de cliente Áurea",
  ],
  [
    CustomerRelationshipOrigin.THIRD_PARTY_REFERRAL,
    "Indicação de terceiro (não cliente)",
  ],
  [CustomerRelationshipOrigin.IN_PERSON_PROSPECTING, "Prospecção presencial"],
  [
    CustomerRelationshipOrigin.INBOUND_CUSTOMER,
    "Cliente me procurou espontaneamente",
  ],
  [
    CustomerRelationshipOrigin.SOCIAL_MEDIA_OR_WHATSAPP,
    "Redes sociais ou WhatsApp",
  ],
  [
    CustomerRelationshipOrigin.CONSULTANT_RELATIVE_OR_FRIEND,
    "Parente ou amigo do consultor",
  ],
  [CustomerRelationshipOrigin.OTHER, "Outro"],
]);

export const OVERALL_RATING_OPTIONS = options([
  [PartnerAssessment.STRONGLY_RECOMMEND, "Recomendo e confio fortemente"],
  [PartnerAssessment.RECOMMEND, "Recomendo"],
  [PartnerAssessment.HAVE_DOUBTS, "Tenho dúvidas"],
  [PartnerAssessment.DO_NOT_RECOMMEND, "Não recomendo"],
]);

export const KINSHIP_OPTIONS = options([
  [GuarantorRelationship.PARENT, "Pai/Mãe"],
  [GuarantorRelationship.SPOUSE, "Cônjuge"],
  [GuarantorRelationship.SIBLING, "Irmão/Irmã"],
  [GuarantorRelationship.CHILD, "Filho(a)"],
  [GuarantorRelationship.OTHER_RELATIVE, "Outro parente"],
  [GuarantorRelationship.UNRELATED, "Sem parentesco"],
]);

export const EXPENSE_CATEGORY_OPTIONS = options([
  [ExpenseCategory.HOUSING_OR_RENT, "Aluguel/Moradia"],
  [ExpenseCategory.SCHOOL_OR_DAYCARE, "Escola/Creche"],
  [ExpenseCategory.MEDICINE_OR_HEALTH, "Remédios/Saúde"],
  [ExpenseCategory.HOUSEHOLD_EXPENSES, "Despesas da casa"],
  [ExpenseCategory.LEISURE, "Lazer"],
  [ExpenseCategory.SAVINGS_GROUP_OR_CONSORTIUM, "Caixa financeiro/consórcio"],
  [ExpenseCategory.CREDIT_CARD, "Cartão de crédito"],
  [ExpenseCategory.OTHER, "Outros"],
]);

export const LOAN_FREQUENCY_OPTIONS = options([
  [LoanFrequency.MONTHLY, "Mensal"],
  [LoanFrequency.BIWEEKLY, "Quinzenal"],
  [LoanFrequency.WEEKLY, "Semanal"],
  [LoanFrequency.DAILY, "Diária"],
]);

export const CREDITOR_INSTITUTION_OPTIONS = options([
  [LoanInstitution.ITAU, "Itaú"],
  [LoanInstitution.SANTANDER, "Santander"],
  [LoanInstitution.CREDIAMIGO, "CrediAmigo"],
  [LoanInstitution.CAIXA, "Caixa"],
  [LoanInstitution.NUBANK, "Nubank"],
  [LoanInstitution.OTHER, "Outros"],
  [LoanInstitution.LOAN_SHARK, "Agiota"],
]);

export const LOAN_CATEGORY_OPTIONS = options([
  [LoanCategory.CREDIT_CARD, "Cartão de crédito"],
  [LoanCategory.OVERDRAFT, "Cheque especial"],
  [LoanCategory.SAVINGS_GROUP_OR_CONSORTIUM, "Caixa financeira/consórcio"],
  [LoanCategory.LOAN_SHARK, "Agiota"],
  [LoanCategory.OTHER, "Outros"],
]);

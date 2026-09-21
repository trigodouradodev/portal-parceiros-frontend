import type { SelectOption } from "@/components/ui/select-option";
import {
  ActivityDuration,
  BusinessActivityBranch,
  BusinessActivitySubcategory,
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
  PaymentPixType,
  ResidenceDuration,
} from "./quotes.enums";

function options(
  entries: ReadonlyArray<readonly [value: string, label: string]>,
): SelectOption[] {
  return entries.map(([value, label]) => ({ value, label }));
}

/** Ordena por label em PT-BR (acento não altera a posição da letra). */
function alphabetical(list: SelectOption[]): SelectOption[] {
  return [...list].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

/** Como `alphabetical`, mas mantém a opção `otherValue` sempre por último. */
function alphabeticalWithOtherLast(
  list: SelectOption[],
  otherValue: string,
): SelectOption[] {
  const other = list.filter((option) => option.value === otherValue);
  const rest = list.filter((option) => option.value !== otherValue);
  return [...alphabetical(rest), ...other];
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
  [EconomicActivityCategory.UNEMPLOYED, "Sem ocupação remunerada/Desempregado"],
  [EconomicActivityCategory.OTHER, "Outros"],
]);

/**
 * Ramo de atividade (AUREA-XXX) — labels alinhadas com a taxonomia real do
 * Analytics (`analytics.vw_dim_cliente_ocupacao.subgrupo_ocupacional`),
 * inclusive a barra espaçada usada lá ("Comércio / Varejo").
 */
export const BUSINESS_ACTIVITY_BRANCH_OPTIONS = alphabetical(
  options([
    [BusinessActivityBranch.RETAIL_COMMERCE, "Comércio / Varejo"],
    [BusinessActivityBranch.FOOD, "Alimentação"],
    [BusinessActivityBranch.AGRICULTURE_RURAL, "Agro / Rural"],
    [BusinessActivityBranch.CONSTRUCTION, "Construção Civil"],
    [BusinessActivityBranch.TRANSPORTATION, "Transporte"],
    [BusinessActivityBranch.HEALTH_AND_CARE, "Saúde e Cuidados"],
    [BusinessActivityBranch.EDUCATION, "Educação"],
    [BusinessActivityBranch.BEAUTY_AND_AESTHETICS, "Beleza e Estética"],
    [BusinessActivityBranch.AUTOMOTIVE, "Automotivo"],
    [BusinessActivityBranch.INDUSTRY_AND_LOGISTICS, "Indústria / Logística"],
    [BusinessActivityBranch.DOMESTIC_SERVICES, "Serviços Domésticos"],
    [BusinessActivityBranch.SECURITY, "Segurança"],
    [
      BusinessActivityBranch.ADMINISTRATIVE_OFFICE,
      "Administrativo / Escritório",
    ],
  ]),
);

const OTHER_SUBCATEGORY_OPTION: readonly [string, string] = [
  BusinessActivitySubcategory.OTHER,
  "Outro",
];

/**
 * Subcategoria de atividade (AUREA-XXX) — uma lista por `BusinessActivityBranch`,
 * baseada na CNAE (IBGE/Receita Federal) e na lista de atividades permitidas
 * para MEI (CGSIM). Cada ramo sempre ganha "Outro" como escape ao final.
 */
export const BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH: Record<
  BusinessActivityBranch,
  SelectOption[]
> = {
  [BusinessActivityBranch.RETAIL_COMMERCE]: alphabeticalWithOtherLast(
    options([
      [BusinessActivitySubcategory.CLOTHING_AND_FASHION, "Vestuário e Moda"],
      [
        BusinessActivitySubcategory.COSMETICS_AND_PERFUMERY,
        "Cosméticos e Perfumaria",
      ],
      [
        BusinessActivitySubcategory.FOOD_AND_BEVERAGE_COMMERCE,
        "Comércio de Alimentos e Bebidas",
      ],
      [BusinessActivitySubcategory.STREET_VENDING, "Comércio Ambulante"],
      [
        BusinessActivitySubcategory.BEVERAGE_DISTRIBUTOR,
        "Distribuidora de Bebidas",
      ],
      [BusinessActivitySubcategory.GENERAL_COMMERCE, "Comércio Geral"],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.FOOD]: alphabeticalWithOtherLast(
    options([
      [
        BusinessActivitySubcategory.RESTAURANT_OR_SNACK_BAR,
        "Restaurante/Lanchonete",
      ],
      [
        BusinessActivitySubcategory.BAKERY_OR_CONFECTIONERY,
        "Padaria/Confeitaria",
      ],
      [
        BusinessActivitySubcategory.HOME_MEALS_OR_CATERING,
        "Marmitex/Comida por encomenda",
      ],
      [
        BusinessActivitySubcategory.FOOD_TRUCK_OR_STREET_FOOD,
        "Food truck/Comida ambulante",
      ],
      [BusinessActivitySubcategory.EVENTS_CATERING, "Buffet/Eventos"],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.AGRICULTURE_RURAL]: alphabeticalWithOtherLast(
    options([
      [BusinessActivitySubcategory.CROP_FARMING, "Agricultura (lavoura)"],
      [BusinessActivitySubcategory.LIVESTOCK, "Pecuária"],
      [BusinessActivitySubcategory.POULTRY_OR_SWINE, "Avicultura/Suinocultura"],
      [BusinessActivitySubcategory.FISHING_OR_AQUACULTURE, "Pesca/Aquicultura"],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.CONSTRUCTION]: alphabeticalWithOtherLast(
    options([
      [BusinessActivitySubcategory.BRICKLAYER_OR_LABORER, "Pedreiro/Servente"],
      [
        BusinessActivitySubcategory.ELECTRICIAN_OR_PLUMBER,
        "Eletricista/Encanador",
      ],
      [
        BusinessActivitySubcategory.SMALL_CONTRACTOR,
        "Pequeno empreiteiro/Reforma",
      ],
      [BusinessActivitySubcategory.PAINTER, "Pintor"],
      [
        BusinessActivitySubcategory.CARPENTRY_OR_MASONRY_WORK,
        "Marcenaria/Marmoraria",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.TRANSPORTATION]: alphabeticalWithOtherLast(
    options([
      [BusinessActivitySubcategory.APP_DRIVER, "Motorista de aplicativo"],
      [BusinessActivitySubcategory.TAXI_DRIVER, "Taxista"],
      [
        BusinessActivitySubcategory.DELIVERY_OR_MOTORCYCLE_COURIER,
        "Motoboy/Entregador",
      ],
      [BusinessActivitySubcategory.FREIGHT_TRANSPORT, "Transporte de carga"],
      [
        BusinessActivitySubcategory.SCHOOL_OR_CHARTER_TRANSPORT,
        "Transporte escolar/fretamento",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.HEALTH_AND_CARE]: alphabeticalWithOtherLast(
    options([
      [
        BusinessActivitySubcategory.ELDERLY_OR_HOME_CAREGIVER,
        "Cuidador(a) de idosos/Home care",
      ],
      [
        BusinessActivitySubcategory.NURSING_TECHNICIAN,
        "Técnico(a) de enfermagem",
      ],
      [
        BusinessActivitySubcategory.THERAPIST_OR_PHYSIOTHERAPIST,
        "Terapeuta/Fisioterapeuta autônomo",
      ],
      [
        BusinessActivitySubcategory.DOMESTIC_CARE_WORKER,
        "Doméstica de cuidados",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.EDUCATION]: alphabeticalWithOtherLast(
    options([
      [
        BusinessActivitySubcategory.PRIVATE_TUTOR,
        "Professor(a) particular/Reforço escolar",
      ],
      [
        BusinessActivitySubcategory.DAYCARE_OR_SMALL_SCHOOL,
        "Creche/Escolinha própria",
      ],
      [
        BusinessActivitySubcategory.LANGUAGE_OR_VOCATIONAL_COURSE,
        "Curso livre/Idiomas",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.BEAUTY_AND_AESTHETICS]: alphabeticalWithOtherLast(
    options([
      [
        BusinessActivitySubcategory.HAIR_SALON_OR_BARBERSHOP,
        "Salão de beleza/Barbearia",
      ],
      [BusinessActivitySubcategory.MANICURE_OR_PEDICURE, "Manicure/Pedicure"],
      [
        BusinessActivitySubcategory.MOBILE_HAIRDRESSER,
        "Cabeleireiro(a) em domicílio",
      ],
      [
        BusinessActivitySubcategory.MAKEUP_OR_EYEBROW_DESIGN,
        "Maquiagem/Design de sobrancelhas",
      ],
      [
        BusinessActivitySubcategory.BODY_AESTHETICS_CLINIC,
        "Estética corporal/Clínica de estética",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.AUTOMOTIVE]: alphabeticalWithOtherLast(
    options([
      [BusinessActivitySubcategory.AUTO_REPAIR_SHOP, "Oficina mecânica"],
      [BusinessActivitySubcategory.AUTO_PARTS, "Autopeças"],
      [
        BusinessActivitySubcategory.CAR_WASH_OR_DETAILING,
        "Lava-rápido/Estética automotiva",
      ],
      [BusinessActivitySubcategory.BODY_SHOP_OR_PAINT, "Funilaria/Pintura"],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.INDUSTRY_AND_LOGISTICS]: alphabeticalWithOtherLast(
    options([
      [
        BusinessActivitySubcategory.SMALL_MANUFACTURING,
        "Pequena fábrica/Produção própria",
      ],
      [
        BusinessActivitySubcategory.GARMENT_OR_SEWING_PRODUCTION,
        "Confecção/Costura",
      ],
      [
        BusinessActivitySubcategory.CARPENTRY_OR_METALWORK_PRODUCTION,
        "Marcenaria/Serralheria",
      ],
      [
        BusinessActivitySubcategory.WAREHOUSING_OR_LOGISTICS,
        "Armazenagem/Logística",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.DOMESTIC_SERVICES]: alphabeticalWithOtherLast(
    options([
      [BusinessActivitySubcategory.DAY_LABORER_CLEANING, "Diarista"],
      [
        BusinessActivitySubcategory.LIVE_IN_OR_MONTHLY_HOUSEKEEPER,
        "Empregada mensalista",
      ],
      [BusinessActivitySubcategory.LAUNDRY_OR_IRONING, "Lavanderia/Passadeira"],
      [
        BusinessActivitySubcategory.CLEANING_TEAM_OR_COMPANY,
        "Equipe/Empresa de limpeza",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.SECURITY]: alphabeticalWithOtherLast(
    options([
      [
        BusinessActivitySubcategory.SECURITY_GUARD_EMPLOYEE,
        "Vigilante/Porteiro",
      ],
      [
        BusinessActivitySubcategory.FREELANCE_SECURITY,
        "Segurança autônomo/eventos",
      ],
      [
        BusinessActivitySubcategory.SECURITY_COMPANY_OWNER,
        "Empresa própria de segurança",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
  [BusinessActivityBranch.ADMINISTRATIVE_OFFICE]: alphabeticalWithOtherLast(
    options([
      [
        BusinessActivitySubcategory.FREELANCE_ADMIN_ASSISTANT,
        "Auxiliar administrativo autônomo",
      ],
      [
        BusinessActivitySubcategory.ACCOUNTING_OFFICE,
        "Contabilidade/Escritório contábil",
      ],
      [
        BusinessActivitySubcategory.VIRTUAL_ASSISTANT_OR_FREELANCER,
        "Assistente virtual/Freelancer",
      ],
      [
        BusinessActivitySubcategory.REAL_ESTATE_OR_INSURANCE_BROKER,
        "Corretor(a) (imóveis/seguros)",
      ],
      OTHER_SUBCATEGORY_OPTION,
    ]),
    BusinessActivitySubcategory.OTHER,
  ),
};

export const CREDIT_PURPOSE_OPTIONS = options([
  [CreditPurpose.BUSINESS_WORKING_CAPITAL, "Fluxo de caixa do negócio"],
  [CreditPurpose.INVENTORY_PURCHASE, "Compra de mercadoria/estoque"],
  [CreditPurpose.WORK_EQUIPMENT_OR_VEHICLE, "Equipamento/veículo de trabalho"],
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

// IncomeSource.MIXED_INCOME não aparece aqui de propósito: com o campo
// renomeado para "Fonte principal da renda declarada", uma fonte "mista"
// não faz sentido como resposta — múltiplas fontes já são capturadas por
// "Possui múltiplas fontes de renda?" + a lista de rendas adicionais. O
// valor do enum continua existindo só por compatibilidade com dado legado
// (zero ocorrências em produção na data desta mudança).
export const INCOME_SOURCE_OPTIONS = options([
  [IncomeSource.SALARY, "Salário"],
  [IncomeSource.OWN_BUSINESS, "Negócio próprio"],
  [IncomeSource.BENEFIT, "Benefício"],
  [IncomeSource.RENT, "Aluguel"],
  [IncomeSource.OTHER, "Outro"],
]);

export const RELATIONSHIP_TIME_OPTIONS = options([
  [CustomerRelationshipDuration.JUST_MET, "Conheci agora"],
  [CustomerRelationshipDuration.LESS_THAN_1_YEAR, "Menos de 1 ano"],
  [CustomerRelationshipDuration.ONE_TO_3_YEARS, "1 a 3 anos"],
  [CustomerRelationshipDuration.MORE_THAN_3_YEARS, "Mais de 3 anos"],
]);

export const HOW_KNOWS_CLIENT_OPTIONS = options([
  [
    CustomerRelationshipOrigin.PREVIOUS_CUSTOMER,
    "Cliente antigo (já teve contrato)",
  ],
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

export const PAYMENT_PIX_OPTIONS = options([
  [PaymentPixType.CPF, "CPF"],
  [PaymentPixType.TELEPHONE, "Celular"],
  [PaymentPixType.EMAIL, "Email"],
  [PaymentPixType.RANDOM_KEY, "Chave Aleatória"],
]);

/** Tipos de comprovante no upload de documentação (passo Documentos). */
export const DOCUMENTATION_INCOME_PROOF_OPTIONS = options([
  [IncomeProofType.BANK_STATEMENT, "Extrato bancário"],
  [IncomeProofType.PAYSLIP, "Holerite"],
  [IncomeProofType.INSS_BENEFIT, "Benefício INSS"],
  [IncomeProofType.MEI_DAS, "MEI / DAS"],
]);

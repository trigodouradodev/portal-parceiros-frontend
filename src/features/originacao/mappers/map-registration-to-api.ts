import type { RegistrationData } from "@/features/originacao/data/proposal";
import type {
  QuoteCreditPurpose,
  QuoteEconomicActivityCategory,
  QuoteGender,
  QuoteGovernmentProgram,
  QuoteHousingStatus,
  QuoteMaritalStatus,
  QuoteResidenceDuration,
  SaveQuoteRegistrationPayload,
} from "@/services/quotes/quotes.types";

const GENDER_BY_LABEL: Record<string, QuoteGender> = {
  Masculino: "male",
  Feminino: "female",
  "Não informado": "not_informed",
};

const ACTIVITY_BY_LABEL: Record<string, QuoteEconomicActivityCategory> = {
  "Aposentado/Pensionista": "retired_or_pensioner",
  "Servidor Público": "public_servant",
  "Empregado CLT": "clt_employee",
  "Empresário (CNPJ ativo)": "business_owner",
  "Autônomo/Informal (MEI)": "self_employed_or_informal",
  "Sem ocupação remunerada/Desempregado": "unemployed",
  Outros: "other",
};

const MARITAL_BY_LABEL: Record<string, QuoteMaritalStatus> = {
  "Solteiro(a)": "single",
  "Casado(a)": "married",
  "União estável": "stable_union",
  "Divorciado(a)": "divorced",
  "Viúvo(a)": "widowed",
};

const HOUSING_BY_LABEL: Record<string, QuoteHousingStatus> = {
  "Próprio quitado": "owned_paid_off",
  "Próprio financiado": "owned_financed",
  Alugado: "rented",
  Cedido: "ceded",
};

const RESIDENCE_BY_LABEL: Record<string, QuoteResidenceDuration> = {
  "Menos de 6 meses": "less_than_6_months",
  "6 meses a 2 anos": "6_months_to_2_years",
  "2 a 5 anos": "2_to_5_years",
  "Mais de 5 anos": "more_than_5_years",
};

const GOVERNMENT_BY_LABEL: Record<string, QuoteGovernmentProgram> = {
  Nenhum: "none",
  "Bolsa Família": "bolsa_familia",
  BPC: "bpc",
  Outro: "other",
};

const CREDIT_PURPOSE_BY_LABEL: Record<string, QuoteCreditPurpose> = {
  "Fluxo de caixa do negócio": "business_working_capital",
  "Compra de mercadoria/estoque": "inventory_purchase",
  "Equipamento/veículo de trabalho": "work_equipment_or_vehicle",
  "Reforma ou construção": "renovation_or_construction",
  "Abertura de novo negócio": "new_business",
  "Quitação/troca de dívida": "debt_payoff_or_refinancing",
  "Despesa pessoal": "personal_expense",
  Saúde: "health",
  Educação: "education",
  Outro: "other",
};

function mapLabel<T extends string>(
  label: string,
  table: Record<string, T>,
): T {
  const mapped = table[label];
  if (!mapped) {
    throw new Error("Não foi possível salvar o cadastro.");
  }
  return mapped;
}

function parseCount(value: string): number {
  return Number(value.replace(/\D/g, ""));
}

/** Traduz o passo Cadastro (labels em PT) para o contrato do PATCH. */
export function mapRegistrationToApi(
  data: RegistrationData,
): SaveQuoteRegistrationPayload {
  const maritalStatus = mapLabel(data.maritalStatus, MARITAL_BY_LABEL);
  const ownsVehicle = data.hasVehicle === true;
  const economicActivityCategories = data.activityCategories.map((label) =>
    mapLabel(label, ACTIVITY_BY_LABEL),
  );
  const hasOtherActivity = economicActivityCategories.includes("other");
  const needsSpouse =
    maritalStatus === "married" || maritalStatus === "stable_union";

  return {
    isRenegotiation: data.isRenewal === true,
    gender: mapLabel(data.gender, GENDER_BY_LABEL),
    secondaryDocument: data.rg.trim(),
    profession: data.occupation.trim(),
    economicActivityCategories,
    ...(hasOtherActivity
      ? { economicActivityOther: data.activityCategoryOther.trim() }
      : {}),
    maritalStatus,
    ...(needsSpouse
      ? { spouseDocument: data.spouseCpf.replace(/\D/g, "") }
      : {}),
    childrenCount: parseCount(data.childrenCount),
    householdMembers: parseCount(data.householdSize),
    housingStatus: mapLabel(data.propertyStatus, HOUSING_BY_LABEL),
    residenceDuration: mapLabel(data.residenceTime, RESIDENCE_BY_LABEL),
    governmentPrograms: data.governmentPrograms.map((label) =>
      mapLabel(label, GOVERNMENT_BY_LABEL),
    ),
    ownsVehicle,
    ...(ownsVehicle ? { vehicleFinanced: data.vehicleFinanced === true } : {}),
    creditPurpose: mapLabel(data.creditPurpose ?? "", CREDIT_PURPOSE_BY_LABEL),
  };
}

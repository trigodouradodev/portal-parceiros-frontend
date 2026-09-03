import type {
  ActivityIncomeData,
  AddressData,
  GuarantorData,
  PartnerOpinionData,
  RegistrationData,
} from "@/features/originacao/data/proposal";
import { parseMoneyBrl } from "@/lib/format/money";
import { roundGeoCoordinate } from "@/services/locations/geo-coords";
import {
  CreditPurpose,
  CustomerRelationshipOrigin,
  EconomicActivityCategory,
  GovernmentProgram,
  LoanInstitution,
  MaritalStatus,
  PartnerAssessment,
  type ActivityDuration,
  type AvailableIncomeProof,
  type CustomerRelationshipDuration,
  type Gender,
  type GuarantorRelationship,
  type HousingStatus,
  type IncomeSource,
  type ResidenceDuration,
} from "./quotes.enums";
import type {
  QuoteDraftAddressPrefill,
  SaveQuoteAddressPayload,
  SaveQuoteGuarantorPayload,
  SaveQuoteIncomePayload,
  SaveQuotePartnerOpinionPayload,
  SaveQuoteRegistrationPayload,
} from "./quotes.types";

function parseCount(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits === "" ? 0 : Number(digits);
}

function optionalTrimmed(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isMarriedStatus(status: string): boolean {
  return (
    status === MaritalStatus.MARRIED || status === MaritalStatus.STABLE_UNION
  );
}

/** Form Cadastro → PATCH /quotes/draft/:id/registration */
export function mapRegistrationToPayload(
  data: RegistrationData,
): SaveQuoteRegistrationPayload {
  const categories =
    data.activityCategories as SaveQuoteRegistrationPayload["economicActivityCategories"];
  const payload: SaveQuoteRegistrationPayload = {
    isRenegotiation: Boolean(data.isRenewal),
    gender: data.gender as Gender,
    secondaryDocument: data.rg.trim(),
    profession: data.occupation.trim(),
    economicActivityCategories: categories,
    maritalStatus: data.maritalStatus as MaritalStatus,
    childrenCount: parseCount(data.childrenCount),
    householdMembers: Math.max(1, parseCount(data.householdSize)),
    housingStatus: data.propertyStatus as HousingStatus,
    residenceDuration: data.residenceTime as ResidenceDuration,
    governmentPrograms:
      data.governmentPrograms as SaveQuoteRegistrationPayload["governmentPrograms"],
    ownsVehicle: Boolean(data.hasVehicle),
    creditPurpose: data.creditPurpose as CreditPurpose,
  };

  if (categories.includes(EconomicActivityCategory.OTHER)) {
    payload.economicActivityOther = data.activityCategoryOther.trim();
  }

  if (isMarriedStatus(data.maritalStatus)) {
    payload.spouseDocument = data.spouseCpf.replace(/\D/g, "");
  }

  if (data.hasVehicle) {
    payload.vehicleFinanced = Boolean(data.vehicleFinanced);
  }

  return payload;
}

/** Form Atividade e Renda → PATCH .../income */
export function mapIncomeToPayload(
  data: ActivityIncomeData,
): SaveQuoteIncomePayload {
  const hasMultiple = Boolean(data.hasMultipleSources);
  const payload: SaveQuoteIncomePayload = {
    activityDuration: data.activityTime as ActivityDuration,
    declaredMonthlyIncome: parseMoneyBrl(data.monthlyIncome),
    incomeSource: data.incomeSource as IncomeSource,
    hasMultipleIncomeSources: hasMultiple,
    availableIncomeProof: data.availableProof as AvailableIncomeProof,
  };

  const businessDocument = optionalTrimmed(data.cnpj);
  if (businessDocument) {
    payload.businessDocument = businessDocument;
  }

  if (hasMultiple) {
    payload.secondaryIncome = parseMoneyBrl(data.secondaryIncome);
  }

  return payload;
}

/** Form Endereço → PATCH .../address */
export function mapAddressToPayload(
  data: AddressData,
): SaveQuoteAddressPayload {
  const complement = optionalTrimmed(data.complement);
  const payload: SaveQuoteAddressPayload = {
    zipCode: data.zipCode.trim(),
    streetName: data.street.trim(),
    streetNumber: data.number.trim(),
    ...(complement ? { streetComplement: complement } : {}),
    streetDistrict: data.neighborhood.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    referencePoint: data.landmark.trim(),
  };

  if (data.geolocation) {
    payload.geolocation = {
      latitude: roundGeoCoordinate(data.geolocation.latitude),
      longitude: roundGeoCoordinate(data.geolocation.longitude),
      precision: data.geolocation.precision.trim(),
    };
  }

  return payload;
}

/** Form Parecer → PATCH .../partner-opinion */
export function mapPartnerOpinionToPayload(
  data: PartnerOpinionData,
): SaveQuotePartnerOpinionPayload {
  const payload: SaveQuotePartnerOpinionPayload = {
    relationshipDuration: data.relationshipTime as CustomerRelationshipDuration,
    relationshipOrigin: data.howKnows as CustomerRelationshipOrigin,
    assessment: data.overallRating as PartnerAssessment,
    hasInformalDebtSigns: Boolean(data.informalDebtSigns),
    hasFinancialUrgencySigns: Boolean(data.financialUrgencySigns),
    opinion: data.notes.trim(),
  };

  if (data.howKnows === CustomerRelationshipOrigin.OTHER) {
    payload.relationshipOriginOther = data.howKnowsOther.trim();
  }

  if (data.howKnows === CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL) {
    const referrerDocument = data.referrerCpf.trim();
    if (referrerDocument.replace(/\D/g, "").length >= 11) {
      payload.referrerDocument = referrerDocument;
    }
  }

  return payload;
}

/** Form Avalista → PATCH .../guarantor */
export function mapGuarantorToPayload(
  data: GuarantorData,
): SaveQuoteGuarantorPayload {
  const complement = optionalTrimmed(data.complement);
  return {
    name: data.name.trim(),
    document: data.cpf.trim(),
    birthDate: data.birthDate.trim(),
    email: data.email.trim(),
    telephone: data.phone.trim(),
    address: {
      zipCode: data.zipCode.trim(),
      streetName: data.street.trim(),
      streetNumber: data.number.trim(),
      ...(complement ? { streetComplement: complement } : {}),
      streetDistrict: data.neighborhood.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
    },
    relationship: data.kinship as GuarantorRelationship,
  };
}

/** Prefill de endereço do draft → campos do formulário */
export function mapDraftAddressPrefillToForm(
  address: QuoteDraftAddressPrefill,
): AddressData {
  return {
    zipCode: address.zipCode,
    street: address.streetName,
    number: address.streetNumber,
    complement: address.streetComplement ?? "",
    neighborhood: address.streetDistrict,
    city: address.city,
    state: address.state,
    landmark: address.referencePoint ?? "",
  };
}

/** Constantes de domínio usadas pelo form/validação (códigos estáveis). */
export const QUOTE_FORM_CODES = {
  OTHER_ACTIVITY: EconomicActivityCategory.OTHER,
  NONE_PROGRAM: GovernmentProgram.NONE,
  DEBT_PURPOSE: CreditPurpose.DEBT_PAYOFF_OR_REFINANCING,
  HOW_KNOWS_OTHER: CustomerRelationshipOrigin.OTHER,
  AUREA_REFERRAL: CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
  HAVE_DOUBTS: PartnerAssessment.HAVE_DOUBTS,
  LOAN_SHARK: LoanInstitution.LOAN_SHARK,
  MARRIED_STATUSES: [
    MaritalStatus.MARRIED,
    MaritalStatus.STABLE_UNION,
  ] as const,
} as const;

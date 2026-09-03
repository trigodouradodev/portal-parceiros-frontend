import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import { formatMoneyBrl } from "@/lib/format/money";
import {
  ActivityDuration,
  AvailableIncomeProof,
  CreditPurpose,
  CustomerRelationshipDuration,
  CustomerRelationshipOrigin,
  EconomicActivityCategory,
  Gender,
  GovernmentProgram,
  GuarantorRelationship,
  HousingStatus,
  IncomeSource,
  MaritalStatus,
  PartnerAssessment,
  ResidenceDuration,
} from "./quotes.enums";
import {
  mapAddressToPayload,
  mapDraftAddressPrefillToForm,
  mapGuarantorToPayload,
  mapIncomeToPayload,
  mapPartnerOpinionToPayload,
  mapRegistrationToPayload,
} from "./map-quote-form";

describe("mapRegistrationToPayload", () => {
  it("maps form fields to API names and stable codes", () => {
    const form = createEmptyProposalForm().registration;
    const payload = mapRegistrationToPayload({
      ...form,
      isRenewal: true,
      gender: Gender.FEMALE,
      rg: "123456789",
      occupation: "Vendedora",
      activityCategories: [EconomicActivityCategory.CLT_EMPLOYEE],
      maritalStatus: MaritalStatus.SINGLE,
      childrenCount: "2",
      householdSize: "4",
      propertyStatus: HousingStatus.RENTED,
      residenceTime: ResidenceDuration.TWO_TO_5_YEARS,
      governmentPrograms: [GovernmentProgram.NONE],
      hasVehicle: false,
      creditPurpose: CreditPurpose.PERSONAL_EXPENSE,
    });

    expect(payload).toEqual({
      isRenegotiation: true,
      gender: Gender.FEMALE,
      secondaryDocument: "123456789",
      profession: "Vendedora",
      economicActivityCategories: [EconomicActivityCategory.CLT_EMPLOYEE],
      maritalStatus: MaritalStatus.SINGLE,
      childrenCount: 2,
      householdMembers: 4,
      housingStatus: HousingStatus.RENTED,
      residenceDuration: ResidenceDuration.TWO_TO_5_YEARS,
      governmentPrograms: [GovernmentProgram.NONE],
      ownsVehicle: false,
      creditPurpose: CreditPurpose.PERSONAL_EXPENSE,
    });
  });

  it("includes conditional spouse, other activity and vehicle fields", () => {
    const form = createEmptyProposalForm().registration;
    const payload = mapRegistrationToPayload({
      ...form,
      isRenewal: false,
      gender: Gender.MALE,
      rg: "987654321",
      occupation: "Feirante",
      activityCategories: [EconomicActivityCategory.OTHER],
      activityCategoryOther: "Feira livre",
      maritalStatus: MaritalStatus.MARRIED,
      spouseCpf: "529.982.247-25",
      childrenCount: "0",
      householdSize: "",
      propertyStatus: HousingStatus.OWNED_PAID_OFF,
      residenceTime: ResidenceDuration.MORE_THAN_5_YEARS,
      governmentPrograms: [GovernmentProgram.BOLSA_FAMILIA],
      hasVehicle: true,
      vehicleFinanced: true,
      creditPurpose: CreditPurpose.DEBT_PAYOFF_OR_REFINANCING,
      debtDescription: "Cartão",
      debtCreditor: "Banco",
    });

    expect(payload.economicActivityOther).toBe("Feira livre");
    expect(payload.spouseDocument).toBe("52998224725");
    expect(payload.vehicleFinanced).toBe(true);
    expect(payload.householdMembers).toBe(1);
    expect(payload).not.toHaveProperty("debtDescription");
  });
});

describe("mapIncomeToPayload", () => {
  it("parses BRL masks and optional CNPJ", () => {
    const form = createEmptyProposalForm().activityIncome;
    const payload = mapIncomeToPayload({
      ...form,
      cnpj: "11.222.333/0001-81",
      activityTime: ActivityDuration.ONE_TO_3_YEARS,
      monthlyIncome: formatMoneyBrl("350000"),
      incomeSource: IncomeSource.SALARY,
      hasMultipleSources: true,
      secondaryIncome: formatMoneyBrl("80000"),
      availableProof: AvailableIncomeProof.PAYSLIP,
    });

    expect(payload).toEqual({
      businessDocument: "11.222.333/0001-81",
      activityDuration: ActivityDuration.ONE_TO_3_YEARS,
      declaredMonthlyIncome: 3500,
      incomeSource: IncomeSource.SALARY,
      hasMultipleIncomeSources: true,
      secondaryIncome: 800,
      availableIncomeProof: AvailableIncomeProof.PAYSLIP,
    });
  });

  it("omits secondary income and CNPJ when empty", () => {
    const form = createEmptyProposalForm().activityIncome;
    const payload = mapIncomeToPayload({
      ...form,
      activityTime: ActivityDuration.LESS_THAN_6_MONTHS,
      monthlyIncome: formatMoneyBrl("100000"),
      incomeSource: IncomeSource.OWN_BUSINESS,
      hasMultipleSources: false,
      availableProof: AvailableIncomeProof.NONE,
    });

    expect(payload.businessDocument).toBeUndefined();
    expect(payload.secondaryIncome).toBeUndefined();
    expect(payload.declaredMonthlyIncome).toBe(1000);
  });
});

describe("mapAddressToPayload", () => {
  it("renames street fields for the connector shape", () => {
    const form = createEmptyProposalForm().address;
    expect(
      mapAddressToPayload({
        ...form,
        zipCode: "01001-000",
        street: "Praça da Sé",
        number: "100",
        complement: "Apto 12",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        landmark: "Próximo à estação",
      }),
    ).toEqual({
      zipCode: "01001-000",
      streetName: "Praça da Sé",
      streetNumber: "100",
      streetComplement: "Apto 12",
      streetDistrict: "Sé",
      city: "São Paulo",
      state: "SP",
      referencePoint: "Próximo à estação",
    });
  });

  it("forwards geolocation when present", () => {
    const form = createEmptyProposalForm().address;
    expect(
      mapAddressToPayload({
        ...form,
        zipCode: "01001-000",
        street: "Praça da Sé",
        number: "100",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        landmark: "Próximo à estação",
        geolocation: {
          latitude: -7.237684265483068,
          longitude: -39.29954049920408,
          precision: "12m",
        },
      }).geolocation,
    ).toEqual({
      latitude: -7.23768427,
      longitude: -39.2995405,
      precision: "12m",
    });
  });
});

describe("mapPartnerOpinionToPayload", () => {
  it("maps notes to opinion and conditional referrer fields", () => {
    const form = createEmptyProposalForm().partnerOpinion;
    const payload = mapPartnerOpinionToPayload({
      ...form,
      relationshipTime: CustomerRelationshipDuration.ONE_TO_3_YEARS,
      howKnows: CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
      referrerCpf: "529.982.247-25",
      overallRating: PartnerAssessment.RECOMMEND,
      informalDebtSigns: false,
      financialUrgencySigns: true,
      notes: "Cliente estável.",
    });

    expect(payload).toEqual({
      relationshipDuration: CustomerRelationshipDuration.ONE_TO_3_YEARS,
      relationshipOrigin: CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
      referrerDocument: "529.982.247-25",
      assessment: PartnerAssessment.RECOMMEND,
      hasInformalDebtSigns: false,
      hasFinancialUrgencySigns: true,
      opinion: "Cliente estável.",
    });
  });
});

describe("mapGuarantorToPayload", () => {
  it("nests address and maps kinship to relationship", () => {
    const form = createEmptyProposalForm().guarantor;
    expect(
      mapGuarantorToPayload({
        ...form,
        name: "João Souza",
        cpf: "390.533.447-05",
        birthDate: "1988-03-15",
        email: "joao@email.com",
        phone: "(11) 98765-4321",
        zipCode: "01001-000",
        street: "Praça da Sé",
        number: "100",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        kinship: GuarantorRelationship.SPOUSE,
      }),
    ).toEqual({
      name: "João Souza",
      document: "390.533.447-05",
      birthDate: "1988-03-15",
      email: "joao@email.com",
      telephone: "(11) 98765-4321",
      address: {
        zipCode: "01001-000",
        streetName: "Praça da Sé",
        streetNumber: "100",
        streetDistrict: "Sé",
        city: "São Paulo",
        state: "SP",
      },
      relationship: GuarantorRelationship.SPOUSE,
    });
  });
});

describe("mapDraftAddressPrefillToForm", () => {
  it("flattens draft address into form fields", () => {
    expect(
      mapDraftAddressPrefillToForm({
        zipCode: "01001000",
        streetName: "Praça da Sé",
        streetNumber: "100",
        streetComplement: "Apto 12",
        streetDistrict: "Sé",
        city: "São Paulo",
        state: "SP",
        referencePoint: "Estação",
      }),
    ).toEqual({
      zipCode: "01001000",
      street: "Praça da Sé",
      number: "100",
      complement: "Apto 12",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      landmark: "Estação",
    });
  });
});

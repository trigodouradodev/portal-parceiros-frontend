import { describe, expect, it } from "vitest";
import {
  clampCountSelect,
  PROPOSAL_STEPS,
  applyRegistrationIdentityToSimulation,
  createEmptyProposalForm,
  createProposalFromSimulation,
  hasSpouse,
} from "@/features/originacao/data/proposal";
import {
  isActivityIncomeValid,
  isAddressValid,
  isDocumentsValid,
  isFinancialValid,
  isGuarantorValid,
  isPartnerOpinionValid,
  isRegistrationValid,
} from "@/features/originacao/schemas/proposal-form";
import type { SimulationSnapshot } from "@/features/originacao/types";
import {
  CreditPurpose,
  CustomerRelationshipOrigin,
  EconomicActivityCategory,
  Gender,
  GuarantorRelationship,
  HousingStatus,
  IncomeSource,
  MaritalStatus,
  PaymentPixType,
  ResidenceDuration,
  GovernmentProgram,
  QuoteStatus,
} from "@/services/quotes/quotes.enums";

const simulation: SimulationSnapshot = {
  id: "sim-1",
  createdAt: "2026-08-13T12:00:00.000Z",
  status: "available",
  name: "Maria Silva",
  birthDate: "1990-01-01",
  email: "maria@email.com",
  telephone: "88997026551",
  document: "11144477735",
  productId: "e58843ce-ad74-4152-910d-83cd96fa6f6b",
  productName: "PESSOAL",
  interestRate: 0.0339,
  amount: 5000,
  installments: 12,
  firstInstallmentDate: "2026-08-10",
  installmentAmount: 500,
};

describe("createProposalFromSimulation", () => {
  it("starts as a 7-step draft with empty form", () => {
    const proposal = createProposalFromSimulation(simulation, {
      id: "quote-1",
      createdAt: "2026-09-02T12:00:00.000Z",
    });
    expect(proposal.id).toBe("quote-1");
    expect(proposal.status).toBe(QuoteStatus.DRAFT);
    expect(proposal.canEdit).toBe(true);
    expect(proposal.step).toBe(0);
    expect(proposal.stepValid).toEqual(
      Array(PROPOSAL_STEPS.length).fill(false),
    );
    expect(proposal.simulation).toEqual(simulation);
    expect(proposal.data.registration.name).toBe("Maria Silva");
    expect(proposal.data.registration.cpf).toBe("111.444.777-35");
    expect(proposal.data.registration.birthDate).toBe("1990-01-01");
    expect(proposal.data.registration.email).toBe("maria@email.com");
    expect(proposal.data.registration.phone).toBe("(88) 99702-6551");
    expect(PROPOSAL_STEPS).toHaveLength(7);
  });

  it("writes edited identity back onto the simulation snapshot", () => {
    expect(
      applyRegistrationIdentityToSimulation(simulation, {
        ...createEmptyProposalForm().registration,
        name: "Maria Souza",
        cpf: "529.982.247-25",
        birthDate: "1988-03-15",
        email: "souza@email.com",
        phone: "(11) 98888-7777",
      }),
    ).toEqual({
      ...simulation,
      name: "Maria Souza",
      document: "52998224725",
      birthDate: "1988-03-15",
      email: "souza@email.com",
      telephone: "11988887777",
    });
  });
});

describe("proposal validators", () => {
  const validRegistration = {
    ...createEmptyProposalForm().registration,
    isRenewal: false,
    name: "Maria Silva",
    cpf: "111.444.777-35",
    birthDate: "1990-01-01",
    email: "maria@email.com",
    phone: "(88) 99702-6551",
    gender: Gender.FEMALE,
    rg: "1234567",
    occupation: "Vendedora",
    businessActivityBranch: "administrative_office",
    activityCategories: [EconomicActivityCategory.CLT_EMPLOYEE],
    maritalStatus: MaritalStatus.SINGLE,
    childrenCount: "0",
    householdSize: "2",
    propertyStatus: HousingStatus.RENTED,
    residenceTime: ResidenceDuration.SIX_MONTHS_TO_2_YEARS,
    governmentPrograms: [GovernmentProgram.NONE],
    hasVehicle: false,
    creditPurpose: CreditPurpose.PERSONAL_EXPENSE,
  };

  it("requires cadastro fields that the draft PATCH validates", () => {
    const empty = createEmptyProposalForm().registration;
    expect(isRegistrationValid(empty)).toBe(false);
    expect(isRegistrationValid(validRegistration)).toBe(true);
    expect(
      isRegistrationValid({
        ...validRegistration,
        name: "",
        email: "invalido",
        phone: "11",
      }),
    ).toBe(false);
    expect(
      isRegistrationValid({
        ...validRegistration,
        spouseCpf: "111.111.111-11",
      }),
    ).toBe(false);
  });

  it("requires extra occupation text and debt details when those options are chosen", () => {
    const base = {
      ...validRegistration,
      activityCategories: [EconomicActivityCategory.OTHER],
      creditPurpose: CreditPurpose.DEBT_PAYOFF_OR_REFINANCING,
    };
    expect(isRegistrationValid(base)).toBe(false);
    expect(
      isRegistrationValid({
        ...base,
        activityCategoryOther: "Feirante",
        debtDescription: "Cartão",
        debtCreditor: "Banco",
      }),
    ).toBe(true);
  });

  it("requires spouse CPF and vehicle financing when those answers apply", () => {
    expect(
      isRegistrationValid({
        ...validRegistration,
        maritalStatus: MaritalStatus.MARRIED,
      }),
    ).toBe(false);
    expect(
      isRegistrationValid({
        ...validRegistration,
        maritalStatus: MaritalStatus.MARRIED,
        spouseCpf: "111.444.777-35",
      }),
    ).toBe(true);
    expect(
      isRegistrationValid({
        ...validRegistration,
        hasVehicle: true,
      }),
    ).toBe(false);
    expect(
      isRegistrationValid({
        ...validRegistration,
        hasVehicle: true,
        vehicleFinanced: false,
      }),
    ).toBe(true);
    expect(
      isRegistrationValid({
        ...validRegistration,
        householdSize: "0",
      }),
    ).toBe(false);
    expect(
      isRegistrationValid({
        ...validRegistration,
        maritalStatus: MaritalStatus.MARRIED,
        spouseCpf: "000.000.000-00",
      }),
    ).toBe(false);
  });

  it("clamps household and children counts to the select range", () => {
    expect(clampCountSelect(null, 0, 5)).toBe("");
    expect(clampCountSelect(0, 0, 5)).toBe("0");
    expect(clampCountSelect(8, 0, 5)).toBe("5");
    expect(clampCountSelect(0, 1, 6)).toBe("1");
    expect(clampCountSelect(10, 1, 6)).toBe("6");
  });

  it("treats married statuses as having a spouse", () => {
    expect(hasSpouse(MaritalStatus.MARRIED)).toBe(true);
    expect(hasSpouse(MaritalStatus.STABLE_UNION)).toBe(true);
    expect(hasSpouse(MaritalStatus.SINGLE)).toBe(false);
  });

  it("validates activity/income required fields", () => {
    const empty = createEmptyProposalForm().activityIncome;
    expect(isActivityIncomeValid(empty)).toBe(false);
    expect(
      isActivityIncomeValid({
        ...empty,
        activityTime: "1_to_3_years",
        monthlyIncome: "3000",
        incomeSource: IncomeSource.SALARY,
      }),
    ).toBe(true);
    expect(
      isActivityIncomeValid({
        ...empty,
        activityTime: "1_to_3_years",
        monthlyIncome: "3000",
        incomeSource: IncomeSource.SALARY,
        hasMultipleSources: true,
      }),
    ).toBe(false);
  });

  it("validates address required fields", () => {
    const empty = createEmptyProposalForm().address;
    expect(isAddressValid(empty)).toBe(false);
    expect(
      isAddressValid({
        ...empty,
        zipCode: "010",
        street: "Rua das Flores",
        number: "10",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      }),
    ).toBe(false);
    expect(
      isAddressValid({
        ...empty,
        zipCode: "01001-000",
        street: "Rua das Flores",
        number: "10",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        landmark: "Próximo à estação",
      }),
    ).toBe(true);
  });

  it("validates partner opinion required fields", () => {
    const empty = createEmptyProposalForm().partnerOpinion;
    expect(isPartnerOpinionValid(empty)).toBe(false);
    const valid = {
      ...empty,
      relationshipTime: "1_to_3_years",
      howKnows: CustomerRelationshipOrigin.IN_PERSON_PROSPECTING,
      informalDebtSigns: false,
      financialUrgencySigns: false,
      notes: "Cliente conhecido da praça.",
    };
    expect(isPartnerOpinionValid(valid)).toBe(true);
    expect(
      isPartnerOpinionValid({ ...valid, referrerCpf: "111.111.111-11" }),
    ).toBe(false);
    expect(
      isPartnerOpinionValid({
        ...valid,
        howKnows: CustomerRelationshipOrigin.OTHER,
      }),
    ).toBe(false);
    expect(
      isPartnerOpinionValid({
        ...valid,
        howKnows: CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
      }),
    ).toBe(false);
    expect(
      isPartnerOpinionValid({
        ...valid,
        howKnows: CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
        referrerCpf: "529.982.247-25",
      }),
    ).toBe(true);
  });

  it("rejects guarantor under 18 and accepts adult with address", () => {
    const empty = createEmptyProposalForm().guarantor;
    expect(isGuarantorValid(empty)).toBe(false);
    const adult = {
      ...empty,
      name: "João Silva",
      cpf: "111.444.777-35",
      birthDate: "1980-01-01",
      email: "joao@email.com",
      phone: "(11) 99999-0000",
      zipCode: "01310-100",
      street: "Av. Paulista",
      number: "1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      kinship: GuarantorRelationship.SPOUSE,
    };
    expect(isGuarantorValid({ ...adult, birthDate: "2015-01-01" })).toBe(false);
    expect(isGuarantorValid({ ...adult, cpf: "111.111.111-11" })).toBe(false);
    expect(isGuarantorValid({ ...adult, zipCode: "013" })).toBe(false);
    expect(isGuarantorValid(adult)).toBe(true);
  });

  it("requires PIX type and a valid PIX key", () => {
    const empty = createEmptyProposalForm().financial;
    expect(isFinancialValid(empty)).toBe(false);
    expect(
      isFinancialValid({
        ...empty,
        paymentPixType: PaymentPixType.CPF,
        paymentPixCode: "529.982.247-25",
      }),
    ).toBe(true);
    expect(
      isFinancialValid({
        ...empty,
        paymentPixType: PaymentPixType.CPF,
        paymentPixCode: "111.111.111-11",
      }),
    ).toBe(false);
  });

  it("requires all document groups, including comprovante de renda (sempre obrigatório)", () => {
    const empty = createEmptyProposalForm().documents;
    expect(isDocumentsValid(empty)).toBe(false);
    expect(
      isDocumentsValid({
        identification: [{ id: "1", filename: "rg.pdf" }],
        proofOfResidence: [{ id: "2", filename: "conta.pdf" }],
        activityPhotos: [{ id: "3", filename: "fachada.jpg" }],
        incomeProofTypes: ["payslip"],
        incomeProofs: [{ id: "4", filename: "holerite.pdf" }],
      }),
    ).toBe(true);
    expect(
      isDocumentsValid({
        identification: [{ id: "1", filename: "rg.pdf" }],
        proofOfResidence: [{ id: "2", filename: "conta.pdf" }],
        activityPhotos: [{ id: "3", filename: "fachada.jpg" }],
        incomeProofTypes: [],
        incomeProofs: [],
      }),
    ).toBe(false);
  });
});

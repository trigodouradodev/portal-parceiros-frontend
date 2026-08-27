import { describe, expect, it } from "vitest";
import {
  PROPOSAL_STEPS,
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

const simulation: SimulationSnapshot = {
  id: "sim-1",
  createdAt: "2026-08-13T12:00:00.000Z",
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
    const proposal = createProposalFromSimulation(simulation);
    expect(proposal.status).toBe("draft");
    expect(proposal.step).toBe(0);
    expect(proposal.stepValid).toEqual(
      Array(PROPOSAL_STEPS.length).fill(false),
    );
    expect(proposal.simulation).toEqual(simulation);
    expect(proposal.data).toEqual(createEmptyProposalForm());
    expect(PROPOSAL_STEPS).toHaveLength(7);
  });
});

describe("proposal validators", () => {
  it("requires occupation and economic activity before the first step is valid", () => {
    const empty = createEmptyProposalForm().registration;
    expect(isRegistrationValid(empty)).toBe(false);
    expect(
      isRegistrationValid({
        ...empty,
        isRenewal: false,
        gender: "Feminino",
        occupation: "Vendedora",
        activityCategories: ["Empregado CLT"],
        creditPurpose: "Despesa pessoal",
      }),
    ).toBe(true);
    expect(
      isRegistrationValid({
        ...empty,
        isRenewal: false,
        gender: "Feminino",
        activityCategories: ["Empregado CLT"],
        creditPurpose: "Despesa pessoal",
      }),
    ).toBe(false);
    expect(
      isRegistrationValid({
        ...empty,
        isRenewal: false,
        gender: "Feminino",
        occupation: "Vendedora",
        activityCategories: ["Empregado CLT"],
        creditPurpose: "Despesa pessoal",
        spouseCpf: "111.111.111-11",
      }),
    ).toBe(false);
  });

  it("requires extra occupation text and debt details when those options are chosen", () => {
    const base = {
      ...createEmptyProposalForm().registration,
      isRenewal: false,
      gender: "Feminino",
      occupation: "Vendedora",
      activityCategories: ["Outros"],
      creditPurpose: "Quitação/troca de dívida",
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

  it("treats married statuses as having a spouse", () => {
    expect(hasSpouse("Casado(a)")).toBe(true);
    expect(hasSpouse("União estável")).toBe(true);
    expect(hasSpouse("Solteiro(a)")).toBe(false);
  });

  it("validates activity/income required fields", () => {
    const empty = createEmptyProposalForm().activityIncome;
    expect(isActivityIncomeValid(empty)).toBe(false);
    expect(
      isActivityIncomeValid({
        ...empty,
        activityTime: "1 a 3 anos",
        monthlyIncome: "3000",
        incomeSource: "Salário",
        availableProof: "Holerite",
      }),
    ).toBe(true);
    expect(
      isActivityIncomeValid({
        ...empty,
        activityTime: "1 a 3 anos",
        monthlyIncome: "3000",
        incomeSource: "Salário",
        availableProof: "Holerite",
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
      }),
    ).toBe(true);
  });

  it("validates partner opinion required fields", () => {
    const empty = createEmptyProposalForm().partnerOpinion;
    expect(isPartnerOpinionValid(empty)).toBe(false);
    const valid = {
      ...empty,
      relationshipTime: "1 a 3 anos",
      howKnows: "Prospecção presencial",
      overallRating: "Recomendo",
      informalDebtSigns: false,
      financialUrgencySigns: false,
      notes: "Cliente conhecido da praça.",
    };
    expect(isPartnerOpinionValid(valid)).toBe(true);
    expect(
      isPartnerOpinionValid({ ...valid, referrerCpf: "111.111.111-11" }),
    ).toBe(false);
    expect(isPartnerOpinionValid({ ...valid, howKnows: "Outro" })).toBe(false);
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
      number: "1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      kinship: "Cônjuge",
    };
    expect(isGuarantorValid({ ...adult, birthDate: "2015-01-01" })).toBe(false);
    expect(isGuarantorValid({ ...adult, cpf: "111.111.111-11" })).toBe(false);
    expect(isGuarantorValid({ ...adult, zipCode: "013" })).toBe(false);
    expect(isGuarantorValid(adult)).toBe(true);
  });

  it("keeps financial step always valid", () => {
    expect(isFinancialValid()).toBe(true);
  });

  it("requires all document groups", () => {
    const empty = createEmptyProposalForm().documents;
    expect(isDocumentsValid(empty)).toBe(false);
    expect(
      isDocumentsValid({
        identification: ["rg.pdf"],
        proofOfResidence: ["conta.pdf"],
        activityPhotos: ["fachada.jpg"],
        incomeProofTypes: ["Holerite"],
        incomeProofs: ["holerite.pdf"],
      }),
    ).toBe(true);
  });
});

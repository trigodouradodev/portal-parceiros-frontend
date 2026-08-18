import { describe, expect, it } from "vitest";
import {
  PROPOSAL_STEPS,
  createEmptyProposalForm,
  createProposalFromSimulation,
  hasSpouse,
  isActivityIncomeValid,
  isAddressValid,
  isDocumentsValid,
  isFinancialValid,
  isGuarantorValid,
  isPartnerOpinionValid,
  isRegistrationValid,
  toggleItem,
} from "@/features/originacao/data/proposal";
import type { SimulacaoSnapshot } from "@/features/originacao/types";

const simulation: SimulacaoSnapshot = {
  id: "sim-1",
  criadaEm: "13/08/2026",
  nome: "Maria Silva",
  nascimento: "1990-01-01",
  produto: "Pessoal",
  taxa: 3.39,
  cpf: "11144477735",
  email: "maria@email.com",
  celular: "(88) 99702-6551",
  valor: 5000,
  parcelas: 12,
  vencimento: 10,
  parcelaCalc: 500,
};

describe("toggleItem", () => {
  it("adds and removes items", () => {
    expect(toggleItem([], "A")).toEqual(["A"]);
    expect(toggleItem(["A", "B"], "A")).toEqual(["B"]);
  });
});

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
  it("requires registration chips before the first step is valid", () => {
    const empty = createEmptyProposalForm().registration;
    expect(isRegistrationValid(empty)).toBe(false);
    expect(
      isRegistrationValid({
        ...empty,
        isRenewal: false,
        gender: "Feminino",
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
        spouseCpf: "111.111.111-11",
      }),
    ).toBe(false);
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

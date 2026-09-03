import { describe, expect, it } from "vitest";
import {
  mapQuoteDetailToProposal,
  nextWizardStepIndex,
} from "@/features/originacao/mappers/map-quote-detail-to-form";
import {
  CreditPurpose,
  EconomicActivityCategory,
  Gender,
  GovernmentProgram,
  HousingStatus,
  MaritalStatus,
  QuoteDraftStep,
  QuoteStatus,
  ResidenceDuration,
} from "@/services/quotes/quotes.enums";
import type { QuoteDetail } from "@/services/quotes/quotes.types";

function baseDetail(overrides: Partial<QuoteDetail> = {}): QuoteDetail {
  return {
    id: "quote-1",
    simulationId: "sim-1",
    partyId: null,
    status: QuoteStatus.DRAFT,
    canEdit: true,
    consultant: { id: "user-1", name: "Parceiro" },
    completedSteps: [QuoteDraftStep.REGISTRATION, QuoteDraftStep.INCOME],
    createdAt: "2026-09-03T12:00:00.000Z",
    updatedAt: "2026-09-03T13:00:00.000Z",
    name: "Maria Silva",
    document: "52998224725",
    birthDate: "1990-01-15",
    email: "maria@example.com",
    telephone: "11999990000",
    productId: "prod-1",
    productName: "Crédito Pessoal",
    interestRate: 0.045,
    financeAmount: 1500,
    installmentNumbers: 12,
    firstInstallmentDate: "2026-10-01",
    installmentAmount: 150,
    totalAmountOwed: 1800,
    registration: {
      isRenegotiation: false,
      gender: Gender.FEMALE,
      secondaryDocument: "1234567",
      profession: "Vendedora",
      economicActivityCategories: [EconomicActivityCategory.CLT_EMPLOYEE],
      economicActivityOther: null,
      maritalStatus: MaritalStatus.SINGLE,
      spouseDocument: null,
      childrenCount: 0,
      householdMembers: 2,
      housingStatus: HousingStatus.RENTED,
      residenceDuration: ResidenceDuration.SIX_MONTHS_TO_2_YEARS,
      governmentPrograms: [GovernmentProgram.NONE],
      ownsVehicle: false,
      vehicleFinanced: null,
      creditPurpose: CreditPurpose.PERSONAL_EXPENSE,
    },
    income: {
      businessDocument: null,
      activityDuration: null,
      declaredMonthlyIncome: 2500,
      incomeSource: null,
      hasMultipleIncomeSources: false,
      secondaryIncome: null,
      availableIncomeProof: null,
    },
    address: {
      zipCode: "01310100",
      streetName: "Av Paulista",
      streetNumber: "1000",
      streetComplement: "",
      streetDistrict: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      referencePoint: null,
      geolocation: null,
    },
    partnerOpinion: {
      relationshipDuration: null,
      relationshipOrigin: null,
      relationshipOriginOther: null,
      referrerDocument: null,
      assessment: null,
      hasInformalDebtSigns: null,
      hasFinancialUrgencySigns: null,
      opinion: null,
    },
    guarantor: null,
    financial: { expenses: [], loans: [] },
    documentation: {
      identificationDocuments: [
        {
          id: "att-1",
          attachmentType: "identification_document",
          filename: "rg.pdf",
          mimetype: "application/pdf",
          size: 10,
          createdAt: "2026-09-03T12:00:00.000Z",
        },
      ],
      proofOfResidence: [],
      activityPhotos: [],
      proofOfIncome: [],
    },
    ...overrides,
  };
}

describe("nextWizardStepIndex", () => {
  it("returns the first incomplete wizard step", () => {
    expect(nextWizardStepIndex([])).toBe(0);
    expect(
      nextWizardStepIndex([QuoteDraftStep.REGISTRATION, QuoteDraftStep.INCOME]),
    ).toBe(2);
    expect(nextWizardStepIndex(Object.values(QuoteDraftStep))).toBe(6);
  });
});

describe("mapQuoteDetailToProposal", () => {
  it("hydrates proposal snapshot and form fields from detail", () => {
    const proposal = mapQuoteDetailToProposal(baseDetail());
    expect(proposal.id).toBe("quote-1");
    expect(proposal.status).toBe("draft");
    expect(proposal.canEdit).toBe(true);
    expect(proposal.step).toBe(2);
    expect(proposal.simulation.name).toBe("Maria Silva");
    expect(proposal.simulation.amount).toBe(1500);
    expect(proposal.data.registration.occupation).toBe("Vendedora");
    expect(proposal.data.activityIncome.monthlyIncome).toMatch(/2\.500/);
    expect(proposal.data.address.street).toBe("Av Paulista");
    expect(proposal.data.documents.identification).toEqual(["rg.pdf"]);
  });
});

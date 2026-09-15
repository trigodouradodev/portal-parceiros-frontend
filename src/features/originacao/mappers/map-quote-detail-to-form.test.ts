import { describe, expect, it } from "vitest";
import {
  mapQuoteDetailToProposal,
  mergeRenewalPrefillIntoForm,
  nextWizardStepIndex,
} from "@/features/originacao/mappers/map-quote-detail-to-form";
import {
  CreditPurpose,
  EconomicActivityCategory,
  Gender,
  GovernmentProgram,
  GuarantorRelationship,
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
    expect(proposal.data.documents.identification).toEqual([
      { id: "att-1", filename: "rg.pdf" },
    ]);
  });

  it("strips DDI 55 from guarantor telephone before masking (AUREA-478)", () => {
    const proposal = mapQuoteDetailToProposal(
      baseDetail({
        guarantor: {
          name: "João Avalista",
          document: "52998224725",
          birthDate: "1985-05-20",
          email: "joao@example.com",
          telephone: "+5571988887777",
          address: {
            zipCode: "40010000",
            streetName: "Rua Chile",
            streetNumber: "10",
            streetComplement: "",
            streetDistrict: "Comércio",
            city: "Salvador",
            state: "BA",
          },
          relationship: GuarantorRelationship.SIBLING,
        },
      }),
    );

    expect(proposal.data.guarantor.phone).toBe("(71) 98888-7777");
  });
});

describe("mergeRenewalPrefillIntoForm", () => {
  it("altera somente cadastro, renda e endereço sem copiar geolocalização", () => {
    const current = mapQuoteDetailToProposal(baseDetail()).data;
    current.registration.debtDescription = "Dívida digitada agora";
    current.registration.debtCreditor = "Outro credor";
    current.address.geolocation = {
      latitude: -23.5,
      longitude: -46.6,
      precision: "12m",
    };
    current.partnerOpinion.notes = "Parecer atual";
    current.guarantor.name = "Avalista atual";
    current.financial.nextId = 99;
    current.documents.identification = [
      { id: "current-document", filename: "atual.pdf" },
    ];

    const source = baseDetail({
      registration: {
        ...baseDetail().registration,
        isRenegotiation: true,
        profession: "Profissão anterior",
      },
      income: {
        ...baseDetail().income,
        declaredMonthlyIncome: 7000,
      },
      address: {
        ...baseDetail().address,
        streetName: "Endereço selecionado pelo backend",
        geolocation: {
          latitude: -1,
          longitude: -2,
          precision: "1m",
        },
      },
      partnerOpinion: {
        ...baseDetail().partnerOpinion,
        opinion: "Parecer da proposta anterior",
      },
      guarantor: {
        name: "Avalista anterior",
        document: "52998224725",
        birthDate: "1980-01-01",
        email: "avalista@example.com",
        telephone: "11999999999",
        address: {
          zipCode: "01001000",
          streetName: "Rua",
          streetNumber: "1",
          streetComplement: "",
          streetDistrict: "Centro",
          city: "São Paulo",
          state: "SP",
        },
        relationship: GuarantorRelationship.SIBLING,
      },
    });

    const result = mergeRenewalPrefillIntoForm(current, source);

    expect(result.registration.occupation).toBe("Profissão anterior");
    expect(result.registration.debtDescription).toBe("Dívida digitada agora");
    expect(result.registration.debtCreditor).toBe("Outro credor");
    expect(result.activityIncome.monthlyIncome).toMatch(/7\.000/);
    expect(result.address.street).toBe("Endereço selecionado pelo backend");
    expect(result.address.geolocation).toEqual(current.address.geolocation);
    expect(result.partnerOpinion).toEqual(current.partnerOpinion);
    expect(result.guarantor).toEqual(current.guarantor);
    expect(result.financial).toEqual(current.financial);
    expect(result.documents).toEqual(current.documents);
  });
});

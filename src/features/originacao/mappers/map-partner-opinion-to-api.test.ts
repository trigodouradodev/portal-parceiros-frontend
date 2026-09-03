import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import { mapPartnerOpinionToApi } from "@/features/originacao/mappers/map-partner-opinion-to-api";
import {
  CustomerRelationshipDuration,
  CustomerRelationshipOrigin,
  PartnerAssessment,
} from "@/services/quotes/quotes.enums";

describe("mapPartnerOpinionToApi", () => {
  it("maps form fields and includes referrer CPF on Áurea referral", () => {
    const form = createEmptyProposalForm().partnerOpinion;
    expect(
      mapPartnerOpinionToApi({
        ...form,
        relationshipTime: CustomerRelationshipDuration.ONE_TO_3_YEARS,
        howKnows: CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
        referrerCpf: "529.982.247-25",
        overallRating: PartnerAssessment.RECOMMEND,
        informalDebtSigns: false,
        financialUrgencySigns: true,
        notes: "Cliente estável.",
      }),
    ).toEqual({
      relationshipDuration: CustomerRelationshipDuration.ONE_TO_3_YEARS,
      relationshipOrigin: CustomerRelationshipOrigin.AUREA_CUSTOMER_REFERRAL,
      referrerDocument: "529.982.247-25",
      assessment: PartnerAssessment.RECOMMEND,
      hasInformalDebtSigns: false,
      hasFinancialUrgencySigns: true,
      opinion: "Cliente estável.",
    });
  });

  it("includes relationshipOriginOther for Outro and omits referrer", () => {
    const form = createEmptyProposalForm().partnerOpinion;
    const payload = mapPartnerOpinionToApi({
      ...form,
      relationshipTime: CustomerRelationshipDuration.LESS_THAN_1_YEAR,
      howKnows: CustomerRelationshipOrigin.OTHER,
      howKnowsOther: "Feira do bairro",
      referrerCpf: "529.982.247-25",
      overallRating: PartnerAssessment.HAVE_DOUBTS,
      informalDebtSigns: true,
      financialUrgencySigns: false,
      notes: "  Precisa de análise.  ",
    });

    expect(payload.relationshipOriginOther).toBe("Feira do bairro");
    expect(payload.referrerDocument).toBeUndefined();
    expect(payload.opinion).toBe("Precisa de análise.");
  });
});

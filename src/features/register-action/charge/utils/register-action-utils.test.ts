import {
  getChargeFlowSteps,
  getChargeStepTitle,
} from "@/features/register-action/charge/utils/flow-steps";
import {
  getRecipientAddressLabel,
  getRecipientPhoneLabel,
} from "@/features/register-action/charge/utils/recipient-labels";
import {
  getV2InteractionOutcomeOptions,
  requiresInteractionObservation,
} from "@/features/register-action/charge/constants/v2-interaction-outcomes";
import { getWaTemplates as getChargeWaTemplates } from "@/features/register-action/charge/utils/wa-templates";
import { getWaTemplates as getPreventiveWaTemplates } from "@/features/register-action/preventive/utils/wa-templates";
import {
  ActivityInteractionResult,
  ActivityRecipientType,
  ActivityTaskType,
  QueueTone,
} from "@/services/activities/activity.enums";

describe("charge flow steps", () => {
  it("labels steps by contact type", () => {
    expect(getChargeFlowSteps("whatsapp")).toEqual([
      "Destinatário",
      "WhatsApp",
      "Resultado",
    ]);
    expect(getChargeFlowSteps("visit")).toEqual([
      "Destinatário",
      "Visita",
      "Resultado da visita",
    ]);
    expect(getChargeStepTitle("contact", "phone")).toBe("Ligação");
    expect(getChargeStepTitle("contact", "visit")).toBe("Resultado da visita");
    expect(getChargeStepTitle("outcome", "phone")).toBe("Resultado do contato");
    expect(getChargeStepTitle("outcome", "visit")).toBe("Resultado da visita");
    expect(getChargeStepTitle("outcome", "whatsapp")).toBe(
      "Resultado do contato",
    );
  });
});

describe("recipient labels", () => {
  it("distinguishes client and guarantor", () => {
    expect(getRecipientAddressLabel(ActivityRecipientType.CLIENT)).toBe(
      "Endereço do cliente",
    );
    expect(getRecipientAddressLabel(ActivityRecipientType.GUARANTOR)).toBe(
      "Endereço do avalista",
    );
    expect(getRecipientPhoneLabel(ActivityRecipientType.CLIENT)).toBe(
      "Telefone cadastrado",
    );
    expect(getRecipientPhoneLabel(ActivityRecipientType.GUARANTOR)).toBe(
      "Telefone do avalista",
    );
  });
});

describe("v2 interaction outcomes", () => {
  it("builds options for contact and visit task types", () => {
    const contact = getV2InteractionOutcomeOptions(ActivityTaskType.CONTACT);
    const visit = getV2InteractionOutcomeOptions(ActivityTaskType.VISIT);

    expect(contact.map((o) => o.value)).toContain(
      ActivityInteractionResult.NO_RESPONSE,
    );
    expect(contact.map((o) => o.value)).not.toContain(
      ActivityInteractionResult.NOT_LOCATED,
    );
    expect(visit.map((o) => o.value)).toContain(
      ActivityInteractionResult.NOT_LOCATED,
    );
    expect(visit.map((o) => o.value)).not.toContain(
      ActivityInteractionResult.NO_RESPONSE,
    );
  });

  it("requires observation only for OTHER", () => {
    expect(
      requiresInteractionObservation(ActivityInteractionResult.OTHER),
    ).toBe(true);
    expect(
      requiresInteractionObservation(ActivityInteractionResult.PAYMENT_PROMISE),
    ).toBe(false);
  });
});

describe("WhatsApp templates", () => {
  it("builds charge template for queue tone", () => {
    const templates = getChargeWaTemplates(
      {
        name: "Maria Silva",
        parcela: "Parcela 2",
        value: "R$ 500,00",
        daysInfo: "10 dias",
      },
      QueueTone.FIRM,
    );

    expect(templates).toHaveLength(1);
    expect(templates[0]?.tag).toBe("Tom firme");
    expect(templates[0]?.message).toContain("Maria");
    expect(templates[0]?.message).toContain("carta de cobrança");
  });

  it("builds preventive templates by daysInfo", () => {
    const today = getPreventiveWaTemplates({
      name: "João Souza",
      parcela: "Parcela 1",
      daysInfo: "Vence hoje",
    });
    expect(today).toHaveLength(2);
    expect(today[0]?.message).toContain("João");
    expect(today[0]?.message).toContain("hoje");

    const soon = getPreventiveWaTemplates({
      name: "João Souza",
      parcela: "Parcela 1",
      daysInfo: "Vence em 5 dias",
    });
    expect(soon[0]?.message).toContain("vence em breve");
  });
});

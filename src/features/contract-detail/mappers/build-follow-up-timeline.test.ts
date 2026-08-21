import { buildFollowUpTimeline } from "@/features/contract-detail/mappers/build-follow-up-timeline";
import {
  AutomaticFollowUpAction,
  FollowUpExpectedResult,
  FollowUpParty,
  FollowUpStatus,
  FollowUpType,
} from "@/services/followup/followup.types";
import type { FollowUpHistoryItem } from "@/services/dashboard/dashboard.types";
import { getFollowUpExpectedResultLabel } from "@/services/followup/followup-labels";

function followUp(fields: Partial<FollowUpHistoryItem>): FollowUpHistoryItem {
  return {
    id: "follow-up-1",
    status: FollowUpStatus.CLIENT_CALL,
    createdAt: "2026-08-21T14:00:00.000Z",
    author: { id: "user-1", name: "Consultor" },
    ...fields,
  };
}

describe("buildFollowUpTimeline", () => {
  it("exibe os campos do modelo estruturado, incluindo resultado e previsão", () => {
    const [step] = buildFollowUpTimeline([
      followUp({
        followUpType: FollowUpType.VISIT,
        party: FollowUpParty.GUARANTOR,
        note: "Envio realizado.",
        expectedResult: FollowUpExpectedResult.REQUESTED_EXTENSION,
        paymentForecast: "2026-08-30",
      }),
    ]);

    expect(step).toMatchObject({
      label: "Visita • Avalista",
      note: "Envio realizado. · Resultado: Pediu prazo extra · Previsão de pagamento: 30/08/2026",
    });
  });

  it("exibe ações automáticas no modelo estruturado", () => {
    const [step] = buildFollowUpTimeline([
      followUp({
        followUpType: FollowUpType.AUTOMATIC,
        party: FollowUpParty.GUARANTOR,
        automaticAction: AutomaticFollowUpAction.NEGATIVATION,
      }),
    ]);

    expect(step.label).toBe("Negativação • Avalista");
  });

  it("mantém o rótulo de status para registros legados", () => {
    const [step] = buildFollowUpTimeline([
      followUp({
        status: FollowUpStatus.GUARANTOR_VISIT,
        note: "Não encontrado no endereço.",
      }),
    ]);

    expect(step).toMatchObject({
      label: "Visita ao avalista",
      note: "Não encontrado no endereço.",
    });
  });

  it("traduz todos os novos resultados", () => {
    expect(getFollowUpExpectedResultLabel(FollowUpExpectedResult.DISPUTE)).toBe(
      "Disputa/contestação",
    );
    expect(
      getFollowUpExpectedResultLabel(FollowUpExpectedResult.DECEASED),
    ).toBe("Falecido");
    expect(getFollowUpExpectedResultLabel(FollowUpExpectedResult.OTHER)).toBe(
      "Outro",
    );
  });
});

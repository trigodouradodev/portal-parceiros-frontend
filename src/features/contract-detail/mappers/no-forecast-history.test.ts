import { buildTaskHistoryTimeline } from "./build-task-history-timeline";
import { buildFollowUpTimeline } from "./build-follow-up-timeline";
import { buildActivityTimeline } from "./build-activity-timeline";
import type { TaskHistoryItem } from "@/services/activities/installment-detail.types";
import { buildV2RegisterInteractionPayload } from "@/features/register-action/utils/map-to-interaction";
import { buildPreventiveFollowUpPayload } from "@/features/register-action/utils/map-to-follow-up";

const task: TaskHistoryItem = {
  id: "t1",
  isCollectible: false,
  segmentCode: "early",
  priority: 1,
  tone: "friendly",
  taskType: "contact",
  status: "completed",
  createdBy: "system",
  expireDate: "2026-11-10",
  wasPostponed: false,
  wasRescheduled: false,
  rescheduleCount: 0,
  createdAt: "2026-11-10T14:00:00Z",
  interaction: {
    id: "i1",
    channel: "call",
    recipientType: "client",
    result: "no_forecast",
    noForecastReason: "job_loss",
    observation: "Detalhes do contato",
    createdAt: "2026-11-10T14:00:00Z",
    author: { id: "u1", name: "Maria" },
  },
};

it("exibe a classificação nos históricos de tarefa e interação sem modificar a observação", () => {
  const step = buildTaskHistoryTimeline([task])[1];
  expect(step.outcome).toBe("Sem previsão — Perda de emprego");
  expect(step.note).toBe("Detalhes do contato");
  expect(
    buildActivityTimeline({ tasks: [], interactions: [task.interaction!] })[0]
      .label,
  ).toBe("Sem previsão — Perda de emprego");
  const legacy = {
    ...task,
    interaction: { ...task.interaction!, noForecastReason: undefined },
  };
  expect(buildTaskHistoryTimeline([legacy])[1].outcome).toBe("Sem previsão");
});

it("exibe o motivo no Follow-up e mantém registros antigos sem classificação", () => {
  const followup = {
    id: "f1",
    status: "client_call",
    expectedResult: "no_forecast",
    noForecastReason: "other",
    note: "Observação original",
    createdAt: "2026-11-10T14:00:00Z",
    author: { id: "u1", name: "Maria" },
  };
  expect(buildFollowUpTimeline([followup])[0].note).toBe(
    "Observação original · Resultado: Sem previsão · Motivo: Outro",
  );
  expect(
    buildFollowUpTimeline([{ ...followup, noForecastReason: undefined }])[0]
      .note,
  ).toBe("Observação original · Resultado: Sem previsão");
});

it("os payloads enviam o motivo somente para Sem previsão", () => {
  expect(
    buildV2RegisterInteractionPayload({
      result: "no_forecast",
      recipientType: "client",
      noForecastReason: "other",
    }).noForecastReason,
  ).toBe("other");
  expect(
    buildV2RegisterInteractionPayload({
      result: "no_response",
      recipientType: "client",
      noForecastReason: "other",
    }).noForecastReason,
  ).toBeUndefined();
  const base = {
    contractId: "c1",
    installmentNumber: 1,
    channel: "phone" as const,
    party: "client" as const,
    noForecastReason: "job_loss" as const,
  };
  expect(
    buildPreventiveFollowUpPayload({ ...base, outcome: "no_forecast" })
      .noForecastReason,
  ).toBe("job_loss");
  expect(
    buildPreventiveFollowUpPayload({ ...base, outcome: "no_return" })
      .noForecastReason,
  ).toBeUndefined();
});

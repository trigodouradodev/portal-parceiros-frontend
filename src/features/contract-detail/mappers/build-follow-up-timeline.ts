import type { TimelineStep } from "@/features/contract-detail/types";
import { formatDate, formatDateTime } from "@/lib/format/date";
import type { FollowUpHistoryItem } from "@/services/dashboard/dashboard.types";
import {
  getFollowUpExpectedResultLabel,
  getFollowUpStatusLabel,
} from "@/services/followup/followup-labels";

function buildFollowUpNote(followUp: FollowUpHistoryItem): string | undefined {
  const parts: string[] = [];

  if (followUp.note) {
    parts.push(followUp.note);
  }

  if (followUp.expectedResult) {
    parts.push(
      `Resultado: ${getFollowUpExpectedResultLabel(followUp.expectedResult)}`,
    );
  }

  if (followUp.paymentForecast) {
    parts.push(
      `Previsão de pagamento: ${formatDate(followUp.paymentForecast)}`,
    );
  }

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function buildFollowUpTimeline(
  followUps: FollowUpHistoryItem[],
): TimelineStep[] {
  const chronological = [...followUps].reverse();

  const historySteps: TimelineStep[] = chronological.map((followUp, index) => ({
    id: followUp.id,
    day: `#${index + 1}`,
    label: getFollowUpStatusLabel(followUp.status),
    status: "done",
    date: formatDateTime(followUp.createdAt),
    agent: followUp.author.name,
    note: buildFollowUpNote(followUp),
  }));

  const currentStep: TimelineStep = {
    id: "next-action",
    day: "Ação",
    label: "Registrar próxima ação",
    status: "current",
    note:
      historySteps.length === 0
        ? "Nenhum follow-up registrado para esta parcela."
        : undefined,
  };

  return [...historySteps, currentStep];
}

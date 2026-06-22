import { formatDueDate } from "@/features/contract-detail/utils/format-date";
import type { TimelineStep } from "@/features/contract-detail/types";
import type { FollowUpHistoryItem } from "@/services/dashboard/dashboard.types";
import {
  getFollowUpExpectedResultLabel,
  getFollowUpStatusLabel,
} from "@/services/followup/followup-labels";

function formatFollowUpDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      `Previsão de pagamento: ${formatDueDate(followUp.paymentForecast)}`,
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
    date: formatFollowUpDate(followUp.createdAt),
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

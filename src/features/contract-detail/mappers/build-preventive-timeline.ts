import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { TimelineStep } from "@/features/contract-detail/types";
import { formatDate, formatShortDateTime } from "@/lib/format/date";
import type { FollowUpHistoryItem } from "@/services/dashboard/dashboard.types";
import {
  getFollowUpExpectedResultLabel,
  getFollowUpStatusLabel,
} from "@/services/followup/followup-labels";

interface PreventiveMilestone {
  id: string;
  day: string;
  label: string;
  offset: number;
}

const PREVENTIVE_MILESTONES: PreventiveMilestone[] = [
  { id: "d-8", day: "D-8", label: "WhatsApp enviado", offset: 8 },
  { id: "d-5", day: "D-5", label: "WhatsApp enviado", offset: 5 },
  { id: "d-2", day: "D-2", label: "Ligação preventiva", offset: 2 },
  { id: "d-1", day: "D-1", label: "WhatsApp de lembrete", offset: 1 },
  { id: "venc", day: "Venc", label: "Boleto vence", offset: 0 },
];

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

function assignMilestoneIndex(daysBeforeDue: number): number {
  const exactIndex = PREVENTIVE_MILESTONES.findIndex(
    (milestone) => milestone.offset === daysBeforeDue,
  );
  if (exactIndex >= 0) {
    return exactIndex;
  }

  for (let index = 0; index < PREVENTIVE_MILESTONES.length; index += 1) {
    if (daysBeforeDue >= PREVENTIVE_MILESTONES[index].offset) {
      return index;
    }
  }

  return 0;
}

export function buildPreventiveTimeline(
  dueDate: string,
  followUps: FollowUpHistoryItem[],
): TimelineStep[] {
  const due = startOfDay(new Date(dueDate));
  const assignedFollowUps = new Map<number, FollowUpHistoryItem>();

  for (const followUp of followUps) {
    const createdAt = startOfDay(new Date(followUp.createdAt));
    const daysBeforeDue = differenceInCalendarDays(due, createdAt);
    const milestoneIndex = assignMilestoneIndex(daysBeforeDue);
    const existing = assignedFollowUps.get(milestoneIndex);

    if (
      !existing ||
      new Date(followUp.createdAt).getTime() >
        new Date(existing.createdAt).getTime()
    ) {
      assignedFollowUps.set(milestoneIndex, followUp);
    }
  }

  let foundCurrent = false;

  return PREVENTIVE_MILESTONES.map((milestone, index) => {
    const followUp = assignedFollowUps.get(index);

    if (followUp) {
      return {
        id: milestone.id,
        day: milestone.day,
        label: getFollowUpStatusLabel(followUp.status) || milestone.label,
        status: "done" as const,
        date: formatShortDateTime(followUp.createdAt),
        agent: followUp.author.name,
        note: buildFollowUpNote(followUp),
      };
    }

    if (!foundCurrent) {
      foundCurrent = true;
      return {
        id: milestone.id,
        day: milestone.day,
        label: milestone.label,
        status: "current" as const,
        date: milestone.offset === 0 ? formatDate(dueDate) : undefined,
      };
    }

    return {
      id: milestone.id,
      day: milestone.day,
      label: milestone.label,
      status: "pending" as const,
      date: milestone.offset === 0 ? formatDate(dueDate) : undefined,
    };
  });
}

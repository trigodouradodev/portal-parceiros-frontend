import type { TimelineStep } from "@/features/contract-detail/types";

const PREVENTIVE_STEPS: Pick<TimelineStep, "id" | "day" | "label">[] = [
  { id: "prev-1", day: "D-8", label: "WhatsApp enviado" },
  { id: "prev-2", day: "D-5", label: "WhatsApp enviado" },
  { id: "prev-3", day: "D-2", label: "Ligação preventiva" },
  { id: "prev-4", day: "D-1", label: "WhatsApp de lembrete" },
  { id: "prev-5", day: "Venc", label: "Boleto vence" },
];

function resolveCurrentIndex(
  daysUntilDue: number,
  followupCount: number,
): number {
  if (followupCount >= 3) return 4;
  if (followupCount >= 2) return 3;
  if (followupCount >= 1) return 2;
  if (daysUntilDue <= 0) return 4;
  if (daysUntilDue <= 1) return 3;
  if (daysUntilDue <= 2) return 2;
  if (daysUntilDue <= 5) return 1;
  return 0;
}

export function buildPreventiveTimeline(
  daysUntilDue: number,
  followupCount: number,
  dueDateLabel?: string,
): TimelineStep[] {
  const currentIndex = resolveCurrentIndex(daysUntilDue, followupCount);

  return PREVENTIVE_STEPS.map((step, index) => ({
    ...step,
    status:
      index < currentIndex
        ? "done"
        : index === currentIndex
          ? "current"
          : "pending",
    date: step.day === "Venc" && dueDateLabel ? dueDateLabel : undefined,
  }));
}

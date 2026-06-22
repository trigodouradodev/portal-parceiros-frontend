import type { CobrStage } from "@/features/dashboard/mocks/tasks";
import { STAGE_INFO } from "@/features/dashboard/mocks/tasks";
import type { TimelineStep } from "@/features/contract-detail/types";

const CHARGE_DAY_LABELS = ["D-8", "D-5", "D-2", "D-1", "Venc", "FUP", "D+10"];

export function buildChargeTimeline(stage: CobrStage): TimelineStep[] {
  const path = STAGE_INFO[stage].journeyPath;
  const currentIndex = Math.max(0, path.length - 1);

  return path.map((label, index) => ({
    id: `charge-${index}`,
    day: CHARGE_DAY_LABELS[index] ?? `Etapa ${index + 1}`,
    label,
    status:
      index < currentIndex
        ? "done"
        : index === currentIndex
          ? "current"
          : "pending",
  }));
}

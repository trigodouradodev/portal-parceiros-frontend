import type { CollectionStageCode } from "@/services/dashboard/dashboard.types";

export interface ReguaBadge {
  label: string;
  color: string;
}

const STAGE_BADGE: Record<CollectionStageCode, ReguaBadge> = {
  friendly: { label: "Amigável", color: "blue" },
  assertive: { label: "Assertivo", color: "amber" },
  warning: { label: "Advertência", color: "red" },
  defaulted: { label: "Aviso de Inadimplência", color: "red" },
};

export function getReguaBadge(
  stageCode?: CollectionStageCode,
  stageBadgeLabel?: string,
): ReguaBadge | undefined {
  if (!stageCode) return undefined;

  const fallback = STAGE_BADGE[stageCode];
  if (!fallback) return undefined;

  return {
    label: stageBadgeLabel ?? fallback.label,
    color: fallback.color,
  };
}

export function getReguaBadgeWhenNoTask(daysOverdue: number): ReguaBadge {
  if (daysOverdue >= 20) return STAGE_BADGE.defaulted;
  if (daysOverdue >= 10) return STAGE_BADGE.warning;
  if (daysOverdue >= 5) return STAGE_BADGE.assertive;
  return STAGE_BADGE.friendly;
}

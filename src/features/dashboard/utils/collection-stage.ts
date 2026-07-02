import type { CollectionStageCode } from "@/services/dashboard/dashboard.types";

export interface ReguaBadge {
  label: string;
  color: string;
}

export interface StageToneMeta {
  label: string;
  chipLabel: string;
  description: string;
  badgeVariant: "green" | "amber" | "red";
  chipClassName: string;
  ctaClassName: string;
  currentDotBorder: string;
  currentDotBg: string;
  currentDotIcon: string;
  currentTextClassName: string;
}

const STAGE_TONE_META: Record<CollectionStageCode, StageToneMeta> = {
  friendly: {
    label: "Amigável",
    chipLabel: "Tom amigável",
    description: "Lembrete cordial de pagamento.",
    badgeVariant: "green",
    chipClassName: "bg-success-bg text-success",
    ctaClassName: "bg-success text-white hover:bg-[#178a65]",
    currentDotBorder: "border-success",
    currentDotBg: "bg-success-bg",
    currentDotIcon: "text-success",
    currentTextClassName: "text-success",
  },
  assertive: {
    label: "Assertivo",
    chipLabel: "Tom firme",
    description: "Alerta com menção à carta de cobrança.",
    badgeVariant: "amber",
    chipClassName: "bg-warning-bg text-warning",
    ctaClassName: "bg-[#BA7517] text-white hover:bg-[#9a6012]",
    currentDotBorder: "border-[#BA7517]",
    currentDotBg: "bg-[#FDF3E0]",
    currentDotIcon: "text-[#BA7517]",
    currentTextClassName: "text-[#BA7517]",
  },
  warning: {
    label: "Advertência",
    chipLabel: "Tom severo",
    description: "Aviso formal com urgência na regularização.",
    badgeVariant: "red",
    chipClassName: "bg-destructive-bg text-destructive",
    ctaClassName: "bg-destructive text-white hover:bg-[#b33030]",
    currentDotBorder: "border-destructive",
    currentDotBg: "bg-destructive-bg",
    currentDotIcon: "text-destructive",
    currentTextClassName: "text-destructive",
  },
  defaulted: {
    label: "Aviso de Inadimplência",
    chipLabel: "Tom severo",
    description: "Aviso formal com ameaça de negativação.",
    badgeVariant: "red",
    chipClassName: "bg-destructive-bg text-destructive",
    ctaClassName: "bg-destructive text-white hover:bg-[#b33030]",
    currentDotBorder: "border-destructive",
    currentDotBg: "bg-destructive-bg",
    currentDotIcon: "text-destructive",
    currentTextClassName: "text-destructive",
  },
};

const STAGE_BADGE: Record<CollectionStageCode, ReguaBadge> = {
  friendly: { label: "Amigável", color: "green" },
  assertive: { label: "Assertivo", color: "amber" },
  warning: { label: "Advertência", color: "red" },
  defaulted: { label: "Aviso de Inadimplência", color: "red" },
};

export function getStageCodeWhenNoTask(daysOverdue: number): CollectionStageCode {
  if (daysOverdue >= 20) return "defaulted";
  if (daysOverdue >= 10) return "warning";
  if (daysOverdue >= 5) return "assertive";
  return "friendly";
}

export function getStageToneMeta(
  stageCode?: CollectionStageCode,
  stageBadgeLabel?: string,
): StageToneMeta | undefined {
  if (!stageCode) return undefined;

  const fallback = STAGE_TONE_META[stageCode];
  if (!fallback) return undefined;

  return {
    ...fallback,
    label: stageBadgeLabel ?? fallback.label,
  };
}

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
  return STAGE_BADGE[getStageCodeWhenNoTask(daysOverdue)];
}

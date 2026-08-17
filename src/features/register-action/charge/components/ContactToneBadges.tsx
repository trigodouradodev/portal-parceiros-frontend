import {
  getQueueToneLabel,
  QUEUE_TONE_CORRECTED_CLASS,
  QUEUE_TONE_DESCRIPTIONS,
  resolveQueueTone,
} from "@/features/dashboard/constants/charge-queue-tone";
import type { QueueTone } from "@/services/activities/activity.enums";

export type ContactToneBadgeVariant = "compact" | "withDescription";

interface ContactToneBadgesProps {
  queueTone?: QueueTone | string;
  templateTag?: string;
  variant?: ContactToneBadgeVariant;
}

const TONE_BOX_CLASS: Record<QueueTone, string> = {
  friendly: "border-[#B7E5D5] bg-[#E6F7F1]/50",
  firm: "border-[#F5D9A8] bg-[#FDF3E0]/60",
  severe: "border-[#F5C4C4] bg-[#FEECEC]/60",
};

export function ContactToneBadges({
  queueTone,
  templateTag,
  variant = "compact",
}: ContactToneBadgesProps) {
  const tone = resolveQueueTone(queueTone);
  const toneLabel = getQueueToneLabel(tone);

  if (variant === "withDescription") {
    return (
      <div
        className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 ${TONE_BOX_CLASS[tone]}`}
      >
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${QUEUE_TONE_CORRECTED_CLASS[tone]}`}
        >
          {toneLabel}
        </span>
        <span className="text-xs text-muted-foreground">
          {QUEUE_TONE_DESCRIPTIONS[tone]}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-brand-navy/10 px-2.5 py-1 text-[11px] font-semibold text-brand-navy">
        {toneLabel}
      </span>
      {templateTag && (
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {templateTag}
        </span>
      )}
    </div>
  );
}

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

export function ContactToneBadges({
  queueTone,
  templateTag,
  variant = "compact",
}: ContactToneBadgesProps) {
  const tone = resolveQueueTone(queueTone);
  const toneLabel = getQueueToneLabel(tone);

  if (variant === "withDescription") {
    return (
      <div className="flex items-center gap-2">
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

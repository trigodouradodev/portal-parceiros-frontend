import { getQueueToneLabel } from "@/features/dashboard/constants/charge-queue-tone";
import type { QueueTone } from "@/services/activities/activity.enums";

interface ContactToneBadgesProps {
  queueTone?: QueueTone | string;
  templateTag?: string;
}

export function ContactToneBadges({
  queueTone,
  templateTag,
}: ContactToneBadgesProps) {
  const toneLabel = getQueueToneLabel(queueTone);

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

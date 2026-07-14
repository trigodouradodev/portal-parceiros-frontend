import { AlertTriangle } from "lucide-react";
import type { QueueTone } from "@/services/activities/activity.enums";
import { QUEUE_TONE_PILL_CLASS } from "@/features/dashboard/constants/charge-queue-tone";
import { cn } from "@/lib/utils";

interface TonePillProps {
  tone: QueueTone;
  children: React.ReactNode;
  className?: string;
  withAlertIcon?: boolean;
}

export function TonePill({
  tone,
  children,
  className,
  withAlertIcon = false,
}: TonePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
        QUEUE_TONE_PILL_CLASS[tone],
        className,
      )}
    >
      {withAlertIcon && <AlertTriangle size={9} />}
      {children}
    </span>
  );
}

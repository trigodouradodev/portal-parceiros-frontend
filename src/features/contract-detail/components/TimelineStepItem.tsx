import { Button } from "@/components/ui/button";
import type { TimelineStep } from "@/features/contract-detail/types";
import {
  getCtaClassName,
  getIconClassName,
  getLabelClassName,
  getStepIcon,
  TONE_META,
} from "@/features/contract-detail/components/timeline-styles";
import { TimelineStepNote } from "@/features/contract-detail/components/TimelineStepNote";

interface TimelineStepItemProps {
  step: TimelineStep;
  isLast: boolean;
  onRegisterAction: () => void;
}

export function TimelineStepItem({
  step,
  isLast,
  onRegisterAction,
}: TimelineStepItemProps) {
  const isEvent = !step.tone;
  const toneMeta = step.tone ? TONE_META[step.tone] : null;
  const icon = getStepIcon(step.label);
  const labelClassName = getLabelClassName(step.status);
  const iconClassName = getIconClassName(step.status);
  const contentClassName = isLast ? "pb-0" : "pb-4";

  return (
    <div className={`min-w-0 flex-1 ${contentClassName}`}>
      {toneMeta && (
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneMeta.bg} ${toneMeta.text}`}
          >
            {toneMeta.label}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground/60">
            {step.day}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {icon && <span className={`shrink-0 ${iconClassName}`}>{icon}</span>}
        <span className={`text-sm font-semibold ${labelClassName}`}>
          {step.label}
        </span>
        {isEvent && (
          <span className="ml-1 text-[10px] font-medium text-muted-foreground">
            {step.day}
          </span>
        )}
      </div>

      {step.date && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {step.date}
          {step.agent ? ` · ${step.agent}` : ""}
        </p>
      )}

      {step.outcome && (
        <span className="mt-1 inline-block rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success">
          {step.outcome}
        </span>
      )}

      {step.note && <TimelineStepNote status={step.status} note={step.note} />}

      {step.status === "current" && (
        <Button
          type="button"
          onClick={onRegisterAction}
          className={`mt-2.5 h-10 w-full rounded-xl text-sm font-semibold text-white ${getCtaClassName(step.tone)}`}
        >
          Registrar {step.label}
        </Button>
      )}
    </div>
  );
}

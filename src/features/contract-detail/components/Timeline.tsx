import type { TimelineStep } from "@/features/contract-detail/types";
import { getConnectorClassName } from "@/features/contract-detail/components/timeline-styles";
import { TimelineStepDot } from "@/features/contract-detail/components/TimelineStepDot";
import { TimelineStepItem } from "@/features/contract-detail/components/TimelineStepItem";

interface TimelineProps {
  steps: TimelineStep[];
  onRegisterAction: () => void;
}

export function Timeline({ steps, onRegisterAction }: TimelineProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <TimelineRow
          key={step.id}
          step={step}
          isLast={index === steps.length - 1}
          onRegisterAction={onRegisterAction}
        />
      ))}
    </div>
  );
}

interface TimelineRowProps {
  step: TimelineStep;
  isLast: boolean;
  onRegisterAction: () => void;
}

function TimelineRow({ step, isLast, onRegisterAction }: TimelineRowProps) {
  const isEvent = !step.tone;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <TimelineStepDot status={step.status} isEvent={isEvent} />
        {!isLast && (
          <div
            className={`mb-0.5 mt-0.5 w-0.5 flex-1 ${getConnectorClassName(step.status)}`}
            style={{ minHeight: 24 }}
          />
        )}
      </div>
      <TimelineStepItem
        step={step}
        isLast={isLast}
        onRegisterAction={onRegisterAction}
      />
    </div>
  );
}

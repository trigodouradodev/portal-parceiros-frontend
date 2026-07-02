import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneChip } from "@/components/collection/ToneChip";
import { getStageToneMeta } from "@/features/dashboard/utils/collection-stage";
import type { TimelineStep } from "@/features/contract-detail/types";
import { cn } from "@/lib/utils";

interface TimelineProps {
  steps: TimelineStep[];
  onRegisterAction: () => void;
}

function StepDot({
  status,
  stageCode,
}: {
  status: TimelineStep["status"];
  stageCode?: TimelineStep["stageCode"];
}) {
  const toneMeta = getStageToneMeta(stageCode);

  if (status === "done") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
        <CheckCircle2 size={16} className="text-white" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
          toneMeta?.currentDotBorder ?? "border-[#BA7517]",
          toneMeta?.currentDotBg ?? "bg-[#FDF3E0]",
        )}
      >
        <Clock
          size={14}
          className={toneMeta?.currentDotIcon ?? "text-[#BA7517]"}
        />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-white" />
  );
}

export function Timeline({ steps, onRegisterAction }: TimelineProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const toneMeta = getStageToneMeta(step.stageCode);

        return (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepDot status={step.status} stageCode={step.stageCode} />
              {!isLast && (
                <div
                  className={`mb-1 mt-1 w-0.5 flex-1 ${
                    step.status === "done" ? "bg-success" : "bg-border"
                  }`}
                  style={{ minHeight: 20 }}
                />
              )}
            </div>
            <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
              {step.stageCode && (
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <ToneChip stageCode={step.stageCode} />
                  <span className="text-[10px] font-medium text-muted-foreground/60">
                    {step.day}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {!step.stageCode && (
                  <span
                    className={`text-xs font-bold ${
                      step.status === "done"
                        ? "text-success"
                        : step.status === "current"
                          ? (toneMeta?.currentTextClassName ?? "text-[#BA7517]")
                          : "text-muted-foreground/80"
                    }`}
                  >
                    {step.day}
                  </span>
                )}
                <span
                  className={`text-sm font-medium ${
                    step.status === "pending"
                      ? "text-muted-foreground/80"
                      : "text-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {step.date && (
                <p className="mt-0.5 text-xs text-muted-foreground/80">
                  {step.date}
                  {step.agent ? ` · ${step.agent}` : ""}
                </p>
              )}
              {step.status === "current" && !step.date && (
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    toneMeta?.currentTextClassName ?? "text-[#BA7517]",
                  )}
                >
                  Hoje
                </p>
              )}
              {step.note && (
                <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">{step.note}</p>
                </div>
              )}
              {step.status === "current" && (
                <Button
                  type="button"
                  onClick={onRegisterAction}
                  className={cn(
                    "mt-2.5 h-11 w-full rounded-xl text-sm font-semibold",
                    toneMeta?.ctaClassName ??
                      "bg-[#BA7517] text-white hover:bg-[#9a6012]",
                  )}
                >
                  {step.actionLabel ?? "Registrar ação"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

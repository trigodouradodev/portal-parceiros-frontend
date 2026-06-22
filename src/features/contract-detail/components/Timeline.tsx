import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimelineStep } from "@/features/contract-detail/types";

interface TimelineProps {
  steps: TimelineStep[];
  onRegisterAction: () => void;
}

function StepDot({ status }: { status: TimelineStep["status"] }) {
  if (status === "done") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
        <CheckCircle2 size={16} className="text-white" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#BA7517] bg-[#FDF3E0]">
        <Clock size={14} className="text-[#BA7517]" />
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

        return (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepDot status={step.status} />
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
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xs font-bold ${
                    step.status === "done"
                      ? "text-success"
                      : step.status === "current"
                        ? "text-[#BA7517]"
                        : "text-muted-foreground/80"
                  }`}
                >
                  {step.day}
                </span>
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
                <p className="mt-0.5 text-xs text-[#BA7517]">Hoje</p>
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
                  className="mt-2.5 h-11 w-full rounded-xl bg-[#BA7517] text-sm font-semibold text-white hover:bg-[#9a6012]"
                >
                  Registrar ação
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

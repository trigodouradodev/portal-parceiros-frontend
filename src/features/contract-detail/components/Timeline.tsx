import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type {
  TimelineStep,
  TimelineTone,
} from "@/features/contract-detail/types";

interface TimelineProps {
  steps: TimelineStep[];
  onRegisterAction: () => void;
}

const TONE_META: Record<
  TimelineTone,
  { label: string; bg: string; text: string; button: string }
> = {
  friendly: {
    label: "Tom amigável",
    bg: "bg-success-bg",
    text: "text-success",
    button: "bg-success hover:bg-success/90",
  },
  firm: {
    label: "Tom firme",
    bg: "bg-warning-bg",
    text: "text-warning",
    button: "bg-[#BA7517] hover:bg-[#9a6012]",
  },
  severe: {
    label: "Tom severo",
    bg: "bg-destructive-bg",
    text: "text-destructive",
    button: "bg-destructive hover:bg-destructive/90",
  },
};

function getStepIcon(label: string): ReactNode | null {
  const normalized = label.toLowerCase();
  if (normalized.includes("whatsapp")) {
    return <MessageSquare size={12} />;
  }
  if (normalized.includes("liga")) {
    return <Phone size={12} />;
  }
  if (normalized.includes("visita")) {
    return <MapPin size={12} />;
  }
  return null;
}

function connectorColor(status: TimelineStep["status"]) {
  if (status === "done") return "bg-success";
  if (status === "missed") return "bg-destructive";
  if (status === "current") return "bg-[#BA7517]";
  return "bg-border";
}

function StepDot({
  status,
  isEvent,
}: {
  status: TimelineStep["status"];
  isEvent: boolean;
}) {
  if (isEvent) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
        <CheckCircle2 size={16} className="text-white" />
      </div>
    );
  }

  if (status === "missed") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive">
        <XCircle size={16} className="text-white" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#BA7517] bg-[#FDF3E0] ring-4 ring-[#FDF3E0]">
        <Clock size={14} className="text-[#BA7517]" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-white">
      <div className="h-2 w-2 rounded-full bg-border" />
    </div>
  );
}

export function Timeline({ steps, onRegisterAction }: TimelineProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isEvent = !step.tone;
        const toneMeta = step.tone ? TONE_META[step.tone] : null;
        const icon = getStepIcon(step.label);

        const labelColor =
          step.status === "missed"
            ? "text-destructive"
            : step.status === "pending"
              ? "text-muted-foreground"
              : "text-foreground";

        const iconColor =
          step.status === "done"
            ? "text-success"
            : step.status === "missed"
              ? "text-destructive"
              : step.status === "current"
                ? "text-[#BA7517]"
                : "text-muted-foreground/60";

        return (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepDot status={step.status} isEvent={isEvent} />
              {!isLast && (
                <div
                  className={`mb-0.5 mt-0.5 w-0.5 flex-1 ${connectorColor(step.status)}`}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
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
                {icon && (
                  <span className={`shrink-0 ${iconColor}`}>{icon}</span>
                )}
                <span className={`text-sm font-semibold ${labelColor}`}>
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

              {step.status === "missed" && step.note && (
                <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-destructive-bg px-3 py-2">
                  <XCircle size={11} className="shrink-0 text-destructive" />
                  <p className="text-xs text-destructive">{step.note}</p>
                </div>
              )}

              {step.status !== "missed" && step.note && (
                <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
                  <MessageCircle
                    size={11}
                    className="shrink-0 text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">{step.note}</p>
                </div>
              )}

              {step.status === "current" && (
                <Button
                  type="button"
                  onClick={onRegisterAction}
                  className={`mt-2.5 h-10 w-full rounded-xl text-sm font-semibold text-white ${
                    toneMeta?.button ?? "bg-[#BA7517] hover:bg-[#9a6012]"
                  }`}
                >
                  Registrar {step.label}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

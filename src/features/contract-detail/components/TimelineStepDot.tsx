import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { TimelineStep } from "@/features/contract-detail/types";

interface TimelineStepDotProps {
  status: TimelineStep["status"];
  isEvent: boolean;
}

export function TimelineStepDot({ status, isEvent }: TimelineStepDotProps) {
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

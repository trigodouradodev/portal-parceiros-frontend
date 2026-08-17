import { MessageCircle, XCircle } from "lucide-react";
import type { TimelineStep } from "@/features/contract-detail/types";

interface TimelineStepNoteProps {
  status: TimelineStep["status"];
  note: string;
}

export function TimelineStepNote({ status, note }: TimelineStepNoteProps) {
  if (status === "missed") {
    return (
      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-destructive-bg px-3 py-2">
        <XCircle size={11} className="shrink-0 text-destructive" />
        <p className="text-xs text-destructive">{note}</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
      <MessageCircle size={11} className="shrink-0 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";
import { QUEUE_HIGHLIGHT_ATTR } from "@/features/dashboard/components/task-cards/ChargeQueueCompactRow";
import { cn } from "@/lib/utils";

export function DoneCard({
  name,
  contract,
  label,
  installmentId,
  highlighted = false,
}: {
  name: string;
  contract: string;
  label: string;
  installmentId?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-l-4 border-l-[#1D9E75] p-4 transition-all duration-700",
        highlighted
          ? "border-brand-yellow bg-brand-yellow/15 opacity-100 ring-2 ring-brand-yellow ring-offset-2"
          : "border-border bg-muted opacity-70",
      )}
      {...(installmentId
        ? { [QUEUE_HIGHLIGHT_ATTR]: installmentId }
        : undefined)}
    >
      <p className="truncate text-sm font-medium text-muted-foreground line-through">
        {name}
      </p>
      <p className="text-xs text-muted-foreground/80">{contract}</p>
      <div className="mt-1 flex items-center gap-1">
        <CheckCircle2 size={11} className="text-success" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

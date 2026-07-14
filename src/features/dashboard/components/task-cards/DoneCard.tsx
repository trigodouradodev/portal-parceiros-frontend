import { CheckCircle2 } from "lucide-react";

export function DoneCard({
  name,
  contract,
  label,
}: {
  name: string;
  contract: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border border-l-4 border-l-[#1D9E75] bg-muted p-4 opacity-70">
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

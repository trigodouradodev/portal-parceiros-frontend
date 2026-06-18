import { CheckCircle2 } from "lucide-react";

export function DoneCard({
  name,
  contract,
  label,
  onReopen,
}: {
  name: string;
  contract: string;
  label: string;
  onReopen?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border border-l-4 border-l-[#1D9E75] bg-muted p-4 opacity-70">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-muted-foreground line-through">
          {name}
        </p>
        <p className="text-xs text-muted-foreground/80">{contract}</p>
        <div className="mt-1 flex items-center gap-1">
          <CheckCircle2 size={11} className="text-success" />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      </div>
      {onReopen && (
        <button
          type="button"
          onClick={onReopen}
          className="shrink-0 text-[11px] text-muted-foreground/80 underline hover:text-muted-foreground"
        >
          Reabrir
        </button>
      )}
    </div>
  );
}

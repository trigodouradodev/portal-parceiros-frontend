import { cn } from "@/lib/utils";
import { getStageToneMeta } from "@/features/dashboard/utils/collection-stage";
import type { CollectionStageCode } from "@/services/dashboard/dashboard.types";

interface ToneChipProps {
  stageCode?: CollectionStageCode;
  badgeLabel?: string;
  showDescription?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ToneChip({
  stageCode,
  badgeLabel,
  showDescription = false,
  size = "sm",
  className,
}: ToneChipProps) {
  const meta = getStageToneMeta(stageCode, badgeLabel);
  if (!meta) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-semibold rounded-full",
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
          meta.chipClassName,
        )}
      >
        {meta.chipLabel}
      </span>
      {showDescription && (
        <span className="text-xs text-muted-foreground/80">{meta.description}</span>
      )}
    </div>
  );
}

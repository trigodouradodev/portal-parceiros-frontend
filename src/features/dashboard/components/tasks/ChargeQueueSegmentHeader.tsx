import type { ChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";

interface ChargeQueueSegmentHeaderProps {
  segment: ChargeQueueSegmentMeta;
  count: number;
  compact?: boolean;
}

export function ChargeQueueSegmentHeader({
  segment,
  count,
  compact = false,
}: ChargeQueueSegmentHeaderProps) {
  if (compact) {
    return (
      <p
        className={`px-1 text-[11px] font-semibold uppercase tracking-wide ${segment.headerClassName}`}
      >
        {segment.label}
      </p>
    );
  }

  const title = segment.description
    ? `${segment.label} — ${segment.description}`
    : segment.label;

  return (
    <div className="flex items-center gap-2.5 py-2">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${segment.dotClassName}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{title}</p>
      </div>
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

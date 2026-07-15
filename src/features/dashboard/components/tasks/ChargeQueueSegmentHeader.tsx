import type { ChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";

interface ChargeQueueSegmentHeaderProps {
  segment: ChargeQueueSegmentMeta;
  count: number;
}

export function ChargeQueueSegmentHeader({
  segment,
  count,
}: ChargeQueueSegmentHeaderProps) {
  const taskLabel = `${count} tarefa${count !== 1 ? "s" : ""}`;

  return (
    <div className="mb-0.5 mt-2 flex items-center gap-2">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${segment.dotClassName}`}
      />
      <span className="text-xs font-semibold text-[#6B7080]">
        {segment.label}
      </span>
      <span className="text-xs text-[#9DA3B4]">· {segment.sublabel}</span>
      <div className="h-px flex-1 bg-[#E2E4EC]" />
      <span className="text-[10px] text-[#9DA3B4]">{taskLabel}</span>
    </div>
  );
}

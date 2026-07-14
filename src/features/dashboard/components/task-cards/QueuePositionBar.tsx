interface QueuePositionBarProps {
  position: number;
  total?: number;
  segmentLabel: string;
  segmentBadgeClassName: string;
}

export function QueuePositionBar({
  position,
  total,
  segmentLabel,
  segmentBadgeClassName,
}: QueuePositionBarProps) {
  return (
    <div className="flex items-center justify-between bg-brand-navy px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-brand-yellow">
          #{position} na fila
        </span>
        {total != null && total > 0 && (
          <span className="text-xs text-white/40">de {total}</span>
        )}
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${segmentBadgeClassName}`}
      >
        {segmentLabel}
      </span>
    </div>
  );
}

interface LadderBarProps {
  segments: { color: string; width: number }[];
  markerPct: number;
}

export function LadderBar({ segments, markerPct }: LadderBarProps) {
  return (
    <div className="relative mb-1.5 flex h-1.5 overflow-visible rounded-full">
      {segments.map((s, i) => (
        <div
          key={i}
          className={`h-full ${i === 0 ? "rounded-l-full" : ""} ${i === segments.length - 1 ? "rounded-r-full" : ""}`}
          style={{ flex: `${s.width} 1 0`, background: s.color }}
        />
      ))}
      <div
        className="absolute -top-1 h-3.5 w-0.5 rounded-sm bg-[#1A1D2E]"
        style={{ left: `${markerPct}%` }}
      >
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-white bg-[#1A1D2E]" />
      </div>
    </div>
  );
}

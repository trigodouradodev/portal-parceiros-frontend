import { LadderBar } from "@/features/performance/components/LadderBar";
import { bandTone, TONE_CHIP } from "@/features/performance/utils/tone";

interface KpiLadderCardProps {
  label: string;
  value: string;
  sub: string;
  bonus: number;
  maxBonus: number;
  segments: { color: string; width: number }[];
  markerPct: number;
  scale: string[];
  hint: string;
}

export function KpiLadderCard({
  label,
  value,
  sub,
  bonus,
  maxBonus,
  segments,
  markerPct,
  scale,
  hint,
}: KpiLadderCardProps) {
  const tone = bandTone(bonus, maxBonus);

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[#D6D9E3] bg-white p-4 shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#4B5165]">{label}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${TONE_CHIP[tone]}`}
        >
          +{Math.round(bonus)}%
        </span>
      </div>
      <div>
        <p className="font-fraunces text-xl font-bold leading-tight text-[#1A1D2E]">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-[#6B7080]">{sub}</p>
      </div>
      <LadderBar segments={segments} markerPct={markerPct} />
      <div className="flex justify-between text-[9px] text-[#6B7080]">
        {scale.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
      <div
        className={`flex items-start gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium ${TONE_CHIP[tone]}`}
      >
        <span className="mt-0.5 shrink-0">→</span>
        <span>{hint}</span>
      </div>
    </div>
  );
}

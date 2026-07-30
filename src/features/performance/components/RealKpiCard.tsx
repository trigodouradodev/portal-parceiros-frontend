import {
  bandTone,
  TONE_CARD,
  TONE_TEXT,
} from "@/features/performance/utils/tone";

interface RealKpiCardProps {
  label: string;
  value: string;
  sub: string;
  bonus: number;
  maxBonus: number;
}

export function RealKpiCard({
  label,
  value,
  sub,
  bonus,
  maxBonus,
}: RealKpiCardProps) {
  const tone = bandTone(bonus, maxBonus);

  return (
    <div
      className={`flex w-52 shrink-0 flex-col gap-1 rounded-2xl border p-4 md:w-auto ${TONE_CARD[tone]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-semibold ${TONE_TEXT[tone]}`}>
          {label}
        </span>
        <span
          className={`shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold ${TONE_TEXT[tone]}`}
        >
          +{Math.round(bonus)}%
        </span>
      </div>
      <p className="font-fraunces text-xl font-bold leading-tight text-[#1A1D2E]">
        {value}
      </p>
      <p className={`text-xs opacity-80 ${TONE_TEXT[tone]}`}>{sub}</p>
    </div>
  );
}

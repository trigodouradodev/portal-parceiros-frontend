import { findNextMilestone } from "@/features/performance/data/commission";
import { fmtBRL } from "@/lib/utils";
import type { ProgramMilestone } from "@/services/performance/performance.types";

interface PermanenceTrailProps {
  mes: number;
  fixo: number;
  milestones: ProgramMilestone[];
}

export function PermanenceTrail({
  mes,
  fixo,
  milestones,
}: PermanenceTrailProps) {
  const lastMonth = milestones[milestones.length - 1]?.month ?? 18;
  const pos = (Math.min(mes, lastMonth) / lastMonth) * 100;
  const next = findNextMilestone(mes, milestones);

  return (
    <div className="mt-5 border-t border-[#D6D9E3] pt-5">
      <p className="mb-5 text-[10px] font-semibold tracking-widest text-[#4B5165] uppercase">
        Bônus de permanência
      </p>
      <div className="relative px-2">
        <div className="absolute top-[7px] right-2 left-2 h-[3px] rounded-full bg-[#D6D9E3]" />
        <div
          className="absolute top-[7px] left-2 h-[3px] rounded-full bg-[#1D9E75]"
          style={{ width: `calc(${pos}% - 4px)` }}
        />
        <div className="relative flex justify-between">
          {milestones.map((m) => {
            const done = mes >= m.month;
            const isNext = !done && next?.month === m.month;
            const value = m.multiplier * fixo;
            return (
              <div
                key={m.month}
                className="relative flex w-24 flex-col items-center gap-2 text-center"
              >
                {mes === m.month && (
                  <span className="absolute -top-5 rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-brand-navy">
                    você está aqui
                  </span>
                )}
                <span
                  className={`h-4 w-4 rounded-full border-[3px] ${
                    done
                      ? "border-[#1D9E75] bg-[#1D9E75]"
                      : isNext
                        ? "border-brand-yellow bg-brand-yellow ring-4 ring-brand-yellow/20"
                        : "border-[#D6D9E3] bg-white"
                  }`}
                />
                <span className="text-xs font-bold text-[#1A1D2E]">
                  {m.month} meses
                </span>
                <span className="text-[11px] text-[#6B7080]">
                  {m.multiplier}× fixo · {fmtBRL(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

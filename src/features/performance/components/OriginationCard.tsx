import type { RealKpiCardView } from "@/features/performance/utils/build-real-performance-view";
import { fmtPct } from "@/features/performance/utils/format";

export function OriginationCard({
  label,
  value,
  sub,
  targetAmount,
  targetPercent,
}: Omit<RealKpiCardView, "key">) {
  const progress =
    targetPercent == null ? null : Math.min(Math.max(targetPercent, 0), 100);
  return (
    <article className="min-w-0 rounded-2xl border border-[#E3E6ED] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-brand-navy">{label}</h3>
        {targetPercent != null && (
          <span className="rounded-md bg-[#F0F2F7] px-2 py-1 text-[10px] font-semibold tabular-nums text-[#535E75]">
            {fmtPct(targetPercent)} da meta
          </span>
        )}
      </div>
      <p className="mt-4 break-words text-3xl font-bold leading-tight tracking-tight tabular-nums text-brand-navy sm:text-[34px]">
        {value}
      </p>
      {sub && (
        <p
          className={`mt-1 text-xs leading-relaxed ${targetAmount != null ? "text-black" : "text-[#697183]"}`}
        >
          {sub}
        </p>
      )}
      {progress !== null && targetPercent != null && (
        <>
          <div
            role="progressbar"
            aria-label="Progresso da meta de originação"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`${fmtPct(targetPercent)} da meta`}
            className="mt-5 h-2 overflow-hidden rounded-full bg-[#E9EDF4]"
          >
            <div
              className="h-full rounded-full bg-brand-navy"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between gap-3 text-[10px] text-[#697183]">
            <span>Produção na competência</span>
            <span className="font-semibold tabular-nums text-brand-navy">
              {fmtPct(targetPercent)} atingido
            </span>
          </div>
        </>
      )}
    </article>
  );
}

import type { RealKpiCardView } from "@/features/performance/utils/build-real-performance-view";

export function RealKpiCard({
  label,
  value,
  sub,
}: Omit<RealKpiCardView, "key">) {
  return (
    <article className="min-w-0 rounded-2xl border border-[#E3E6ED] bg-white p-4 sm:p-5">
      <h3 className="text-xs font-semibold text-brand-navy">{label}</h3>
      <p className="mt-3 break-words text-2xl font-bold leading-tight tracking-tight tabular-nums text-brand-navy sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-[#697183]">{sub}</p>
    </article>
  );
}

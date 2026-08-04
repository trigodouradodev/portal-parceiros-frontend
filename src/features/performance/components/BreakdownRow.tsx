import { fmtBRL } from "@/lib/utils";

interface BreakdownRowProps {
  name: string;
  sub?: string;
  value: number;
  tag?: string;
  dim?: boolean;
  isTotal?: boolean;
}

export function BreakdownRow({
  name,
  sub,
  value,
  tag,
  dim,
  isTotal,
}: BreakdownRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${isTotal ? "mt-1 border-t-2 border-[#D6D9E3] pt-3" : "border-b border-[#EBEDF3] last:border-b-0"}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`truncate text-sm ${isTotal ? "font-bold text-[#1A1D2E]" : dim ? "text-[#8B92A8]" : "text-[#1A1D2E]"}`}
        >
          {name}
        </span>
        {tag && (
          <span className="shrink-0 rounded-full bg-brand-yellow px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-brand-navy uppercase">
            {tag}
          </span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span
          className={`font-mono-dm shrink-0 text-sm ${isTotal ? "text-base font-bold text-[#1A1D2E]" : dim ? "font-medium text-[#8B92A8]" : "font-semibold text-[#1A1D2E]"}`}
        >
          {dim ? "" : "+"}
          {fmtBRL(value)}
        </span>
        {sub && <span className="text-[10px] text-[#6B7080]">{sub}</span>}
      </div>
    </div>
  );
}

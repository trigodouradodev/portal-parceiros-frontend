const PILL_TONE = {
  neutral: "border-white/25 bg-white/15 text-white",
  yellow: "border-brand-yellow bg-brand-yellow text-brand-navy",
  green: "border-[#BFE6D7] bg-[#E6F7F1] text-[#0F6E56]",
  navy: "border-white bg-white text-brand-navy",
  amber: "border-[#F2DBA6] bg-[#FDF3E0] text-[#854F0B]",
} as const;

interface CommissionPillProps {
  children: React.ReactNode;
  tone?: keyof typeof PILL_TONE;
}

export function CommissionPill({
  children,
  tone = "neutral",
}: CommissionPillProps) {
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${PILL_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

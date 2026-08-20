import type { ReactNode } from "react";

type CardVariant = "navy" | "amber" | "red" | "blue";

const cardStyles: Record<CardVariant, string> = {
  navy: "bg-brand-navy text-white",
  amber: "bg-[#FDF3E0] text-[#854F0B]",
  red: "bg-[#FEECEC] text-[#A32D2D]",
  blue: "bg-[#FFF6D2] text-brand-navy",
};

const cardValueStyles: Record<CardVariant, string> = {
  navy: "text-white",
  amber: "text-[#BA7517]",
  red: "text-[#D84040]",
  blue: "text-brand-navy",
};

interface SummaryCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  variant: CardVariant;
  onClick: () => void;
}

export function SummaryCard({
  icon,
  value,
  label,
  variant,
  onClick,
}: SummaryCardProps) {
  let labelClassName = "mt-1 text-xs text-current opacity-70";
  if (variant === "navy") {
    labelClassName = "mt-1 text-xs text-white/70";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver contratos: ${label}`}
      className={`w-[calc((100%-1.25rem-0.75rem-3rem)/2)] shrink-0 snap-start rounded-2xl p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:w-auto md:snap-align-none ${cardStyles[variant]}`}
    >
      <div className="mb-2 opacity-80">{icon}</div>
      <p
        className={`text-2xl font-bold leading-none ${cardValueStyles[variant]}`}
      >
        {value}
      </p>
      <p className={labelClassName}>{label}</p>
    </button>
  );
}

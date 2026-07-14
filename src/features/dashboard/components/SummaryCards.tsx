import type { ReactNode } from "react";

type CardVariant = "navy" | "amber" | "red" | "blue";

const cardStyles: Record<CardVariant, string> = {
  navy: "bg-brand-navy text-white",
  amber: "bg-[#FDF3E0] text-[#854F0B]",
  red: "bg-[#FEECEC] text-[#A32D2D]",
  blue: "bg-brand-yellow/20 text-brand-navy",
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
}

export function SummaryCard({ icon, value, label, variant }: SummaryCardProps) {
  return (
    <div
      className={`w-36 shrink-0 rounded-2xl p-4 shadow-sm md:w-auto ${cardStyles[variant]}`}
    >
      <div className="mb-2 opacity-80">{icon}</div>
      <p
        className={`text-2xl font-bold leading-none ${cardValueStyles[variant]}`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${variant === "navy" ? "text-white/70" : "text-current opacity-70"}`}
      >
        {label}
      </p>
    </div>
  );
}

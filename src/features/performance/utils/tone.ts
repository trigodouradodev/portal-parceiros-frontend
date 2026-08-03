export type BandTone = "ok" | "warn" | "crit";

export function bandTone(bonus: number, maxBonus: number): BandTone {
  if (bonus <= 0) return "crit";
  if (bonus < maxBonus) return "warn";
  return "ok";
}

export const TONE_CHIP: Record<BandTone, string> = {
  ok: "bg-[#E6F7F1] text-[#0F6E56]",
  warn: "bg-[#FDF3E0] text-[#854F0B]",
  crit: "bg-[#FEECEC] text-[#A32D2D]",
};

export const TONE_CARD: Record<BandTone, string> = {
  ok: "bg-[#E6F7F1] border-[#BFE6D7]",
  warn: "bg-[#FDF3E0] border-[#F2DBA6]",
  crit: "bg-[#FEECEC] border-[#F5C9C9]",
};

export const TONE_TEXT: Record<BandTone, string> = {
  ok: "text-[#0F6E56]",
  warn: "text-[#854F0B]",
  crit: "text-[#A32D2D]",
};

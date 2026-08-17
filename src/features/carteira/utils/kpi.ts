export type KpiTone = "neutral" | "ok" | "warn" | "crit";

/** Limiares da espec (RN04): ≤5% ok · ≤15% warn · >15% crit. */
export function inadTone(pct: number): KpiTone {
  if (pct <= 5) return "ok";
  if (pct <= 15) return "warn";
  return "crit";
}

export const ICON_CIRCLE: Record<KpiTone, string> = {
  neutral: "bg-brand-yellow text-brand-navy",
  ok: "bg-[#1D9E75] text-white",
  warn: "bg-[#BA7517] text-white",
  crit: "bg-[#D84040] text-white",
};

export const TONE_TEXT: Record<KpiTone, string> = {
  neutral: "text-[#4B5165]",
  ok: "text-[#0F6E56]",
  warn: "text-[#854F0B]",
  crit: "text-[#A32D2D]",
};

export const fmtPct = (v: number, digits = 2) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }) + "%";

export const fmtInt = (v: number) => v.toLocaleString("pt-BR");

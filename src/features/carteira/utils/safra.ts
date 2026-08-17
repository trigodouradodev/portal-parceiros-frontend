/** RN06: variação < 0,005pp é neutra. */
const FLAT_EPS = 0.005;

export type TrendDirection = "up" | "down" | "flat";
export type TrendSentiment = "good" | "bad" | "neutral";

export function trendDirection(delta: number): TrendDirection {
  if (delta > FLAT_EPS) return "up";
  if (delta < -FLAT_EPS) return "down";
  return "flat";
}

/**
 * Em métricas invertidas (Reneg / Inad), subir é ruim.
 */
export function trendSentiment(delta: number, invert: boolean): TrendSentiment {
  const direction = trendDirection(delta);
  if (direction === "flat") return "neutral";
  const rising = direction === "up";
  if (invert) return rising ? "bad" : "good";
  return rising ? "good" : "bad";
}

export function formatTrendDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(2)}pp`;
}

import {
  bandsOf,
  maxBonusPercent,
} from "@/features/performance/data/commission";
import type { BonusBand } from "@/services/performance/performance.types";
import {
  BonusPillar,
  type PartnerProgram,
} from "@/services/performance/performance.types";

const COLORS_BY_BONUS_ASC = [
  "#D84040",
  "#BA7517",
  "#8FCB6B",
  "#1D9E75",
] as const;

const COLORS_BY_BONUS_DESC = [
  "#1D9E75",
  "#8FCB6B",
  "#BA7517",
  "#D84040",
] as const;

export interface LadderSegment {
  color: string;
  width: number;
}

export interface PillarLadderView {
  segments: LadderSegment[];
  scale: [string, string, string];
  sliderMin: number;
  sliderMax: number;
  maxBonus: number;
  markerPct: (value: number) => number;
}

function formatScale(value: number, suffix = "%"): string {
  const n = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${n}${suffix}`;
}

function bandSpan(band: BonusBand, rangeMax: number): number {
  const lo = band.minValue;
  const hi = band.maxValue === null ? rangeMax : band.maxValue;
  if (hi === lo) return Math.max(rangeMax * 0.02, 0.5);
  return Math.max(hi - lo, 0);
}

function colorForBonus(
  bonusPercent: number,
  maxBonus: number,
  ascending: boolean,
): string {
  const palette = ascending ? COLORS_BY_BONUS_ASC : COLORS_BY_BONUS_DESC;
  if (maxBonus <= 0) return palette[0];

  // ascending: 0 → vermelho, teto → verde
  // descending (risco): 0 → vermelho (fim), teto → verde (início)
  if (ascending) {
    if (bonusPercent <= 0) return palette[0];
    if (bonusPercent >= maxBonus) return palette[palette.length - 1];
    const ratio = bonusPercent / maxBonus;
    const idx = Math.min(
      palette.length - 2,
      Math.max(1, Math.round(ratio * (palette.length - 1))),
    );
    return palette[idx];
  }

  if (bonusPercent <= 0) return palette[palette.length - 1];
  if (bonusPercent >= maxBonus) return palette[0];
  const ratio = 1 - bonusPercent / maxBonus;
  const idx = Math.min(
    palette.length - 2,
    Math.max(1, Math.round(ratio * (palette.length - 1))),
  );
  return palette[idx];
}

function buildLadder(
  bands: BonusBand[],
  opts: {
    visualMin: number;
    visualMax: number;
    sliderMin: number;
    sliderMax: number;
    ascendingColors: boolean;
    scaleMid: number;
    scaleEndLabel: string;
  },
): PillarLadderView {
  const maxBonus = maxBonusPercent(bands);
  const spanTotal = Math.max(opts.visualMax - opts.visualMin, 1);

  const segments = bands.map((band) => ({
    color: colorForBonus(band.bonusPercent, maxBonus, opts.ascendingColors),
    width: bandSpan(
      {
        ...band,
        minValue: Math.max(band.minValue, opts.visualMin),
        maxValue:
          band.maxValue === null
            ? opts.visualMax
            : Math.min(band.maxValue, opts.visualMax),
      },
      opts.visualMax,
    ),
  }));

  // Normaliza widths relativos ao range visual
  const widthSum = segments.reduce((s, seg) => s + seg.width, 0) || 1;
  const normalized = segments.map((seg) => ({
    ...seg,
    width: (seg.width / widthSum) * spanTotal,
  }));

  return {
    segments: normalized,
    scale: [
      formatScale(opts.visualMin),
      formatScale(opts.scaleMid),
      opts.scaleEndLabel,
    ],
    sliderMin: opts.sliderMin,
    sliderMax: opts.sliderMax,
    maxBonus,
    markerPct: (value: number) => {
      const clamped = Math.min(Math.max(value, opts.visualMin), opts.visualMax);
      return ((clamped - opts.visualMin) / spanTotal) * 100;
    },
  };
}

/** Thresholds finitos das faixas (min/max), ordenados. */
function finiteThresholds(bands: BonusBand[]): number[] {
  const values = new Set<number>();
  for (const band of bands) {
    values.add(band.minValue);
    if (band.maxValue !== null) values.add(band.maxValue);
  }
  return [...values].sort((a, b) => a - b);
}

export function buildDisbursementLadder(
  program: PartnerProgram,
): PillarLadderView {
  const bands = bandsOf(program, BonusPillar.DISBURSEMENT);
  const thresholds = finiteThresholds(bands);
  const firstBonusAt = thresholds.find((t) => t > 0) ?? 100;
  const lastFinite = thresholds[thresholds.length - 1] ?? 120;
  const visualMax = Math.max(lastFinite * 1.15, 140);

  return buildLadder(bands, {
    visualMin: 0,
    visualMax,
    sliderMin: 0,
    sliderMax: visualMax,
    ascendingColors: true,
    scaleMid: firstBonusAt,
    scaleEndLabel: `${formatScale(lastFinite)}+`,
  });
}

export function buildRiskLadder(program: PartnerProgram): PillarLadderView {
  const bands = bandsOf(program, BonusPillar.RISK);
  const thresholds = finiteThresholds(bands);
  const mid = thresholds.find((t) => t > 0) ?? 3.5;
  const lastFinite =
    thresholds.filter((t) => t > 0).at(-1) ?? thresholds.at(-1) ?? 5;
  const visualMax = Math.max(lastFinite * 1.6, 8);

  return buildLadder(bands, {
    visualMin: 0,
    visualMax,
    sliderMin: 0,
    sliderMax: visualMax,
    ascendingColors: false,
    scaleMid: mid,
    scaleEndLabel: `${formatScale(visualMax)}+`,
  });
}

export function buildRateLadder(program: PartnerProgram): PillarLadderView {
  const bands = bandsOf(program, BonusPillar.RATE);
  const thresholds = finiteThresholds(bands);
  const first = thresholds[0] ?? 0;
  const mid = thresholds.find((t) => t >= 9) ?? thresholds[1] ?? 9.5;
  const lastFinite = thresholds.at(-1) ?? 10;
  const visualMin = Math.max(0, first > 0 ? first - 2.5 : 7);
  const visualMax = Math.max(lastFinite + 2, 12);

  return buildLadder(bands, {
    visualMin,
    visualMax,
    sliderMin: visualMin,
    sliderMax: visualMax,
    ascendingColors: true,
    scaleMid: mid,
    scaleEndLabel: formatScale(visualMax),
  });
}

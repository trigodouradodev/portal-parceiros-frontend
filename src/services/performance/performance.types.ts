/**
 * Types matching portal-parceiros-backend/src/performance/interfaces/
 */

export const BonusPillar = {
  DISBURSEMENT: "DISBURSEMENT",
  RISK: "RISK",
  RATE: "RATE",
} as const;

export type BonusPillar = (typeof BonusPillar)[keyof typeof BonusPillar];

export const CommissionComponentKind = {
  FIXED: "FIXED",
  WELCOME: "WELCOME",
  DISBURSEMENT_BONUS: "DISBURSEMENT_BONUS",
  RISK_BONUS: "RISK_BONUS",
  RATE_BONUS: "RATE_BONUS",
  PERMANENCE_BONUS: "PERMANENCE_BONUS",
} as const;

export type CommissionComponentKind =
  (typeof CommissionComponentKind)[keyof typeof CommissionComponentKind];


export interface PartnerIdentity {
  id: string;
  fullName: string;
  roleLabel: string | null;
}

export interface PartnerLevel {
  key: string;
  label: string;
  monthlyTarget: number;
  monthlyFixed: number;
}

export interface NextPermanenceMilestone {
  month: number;
  multiplier: number;
  amount: number;
  monthsRemaining: number;
}

export interface PartnershipStatus {
  startedAt: string;
  monthNumber: number;
  isFirstMonth: boolean;
  nextMilestone: NextPermanenceMilestone | null;
}

/** GET /performance/me */
export interface PartnerProfile {
  partner: PartnerIdentity;
  level: PartnerLevel;
  partnership: PartnershipStatus;
}

export interface BonusBand {
  minValue: number;
  minInclusive: boolean;
  maxValue: number | null;
  maxInclusive: boolean;
  bonusPercent: number;
}

export interface BonusPillarBands {
  pillar: BonusPillar;
  bands: BonusBand[];
}

export interface ProgramMilestone {
  month: number;
  multiplier: number;
}

/** GET /performance/program */
export interface PartnerProgram {
  welcomeBonusAmount: number;
  levels: PartnerLevel[];
  bonusPillars: BonusPillarBands[];
  permanenceMilestones: ProgramMilestone[];
}

export interface OriginationPerformance {
  count: number;
  amount: number;
  targetPercent: number;
  bonusPercent: number;
}

export interface DelinquencyPerformance {
  rate: number | null;
  overdueAmount: number;
  portfolioOpenAmount: number;
  bonusPercent: number;
}

export interface AverageRatePerformance {
  rate: number | null;
  bonusPercent: number;
}

export interface CommissionComponent {
  kind: CommissionComponentKind;
  amount: number;
}

export interface CommissionSummary {
  total: number;
  components: CommissionComponent[];
}

/** GET /performance/current */
export interface CurrentPerformance {
  month: string;
  periodStart: string;
  periodEnd: string;
  origination: OriginationPerformance;
  delinquency: DelinquencyPerformance;
  averageRate: AverageRatePerformance;
  commission: CommissionSummary;
}

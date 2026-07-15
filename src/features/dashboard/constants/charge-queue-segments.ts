export type ChargeQueueSegmentCode =
  | "recent"
  | "broken_promise"
  | "fpd"
  | "early"
  | "mid"
  | "late"
  | "critical";

export interface ChargeQueueSegmentMeta {
  code: ChargeQueueSegmentCode;
  label: string;
  sublabel: string;
  dotClassName: string;
  borderColor: string;
  badgeClassName: string;
}

export const CHARGE_QUEUE_SEGMENT_ORDER: ChargeQueueSegmentCode[] = [
  "recent",
  "broken_promise",
  "fpd",
  "early",
  "mid",
  "late",
  "critical",
];

const SEGMENT_META: Record<ChargeQueueSegmentCode, ChargeQueueSegmentMeta> = {
  recent: {
    code: "recent",
    label: "Recém vencido",
    sublabel: "D+1–2 · primeiro contato",
    dotClassName: "bg-blue-500",
    borderColor: "#3B82F6",
    badgeClassName: "bg-blue-100 text-blue-800",
  },
  broken_promise: {
    code: "broken_promise",
    label: "Promessa quebrada",
    sublabel: "Prometeu pagar e não cumpriu",
    dotClassName: "bg-red-500",
    borderColor: "#DC2626",
    badgeClassName: "bg-red-100 text-red-700",
  },
  fpd: {
    code: "fpd",
    label: "FPD",
    sublabel: "Inadimplência do 1º pagamento",
    dotClassName: "bg-red-500",
    borderColor: "#DC2626",
    badgeClassName: "bg-red-100 text-red-700",
  },
  early: {
    code: "early",
    label: "Atraso D+2–5",
    sublabel: "Atraso inicial · contato",
    dotClassName: "bg-amber-500",
    borderColor: "#D97706",
    badgeClassName: "bg-amber-100 text-amber-800",
  },
  mid: {
    code: "mid",
    label: "Atraso D+6–15",
    sublabel: "Atraso médio · visita necessária",
    dotClassName: "bg-amber-500",
    borderColor: "#D97706",
    badgeClassName: "bg-amber-100 text-amber-800",
  },
  late: {
    code: "late",
    label: "Pós carta D+15",
    sublabel: "Pós carta · aviso de negativação",
    dotClassName: "bg-orange-500",
    borderColor: "#EA580C",
    badgeClassName: "bg-orange-100 text-orange-800",
  },
  critical: {
    code: "critical",
    label: "Risco negativação",
    sublabel: "D+20+ · iminente negativação",
    dotClassName: "bg-purple-500",
    borderColor: "#7C3AED",
    badgeClassName: "bg-purple-100 text-purple-800",
  },
};

export function getChargeQueueSegmentMeta(
  code: ChargeQueueSegmentCode,
): ChargeQueueSegmentMeta {
  return SEGMENT_META[code];
}

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
  description: string;
  subtitle: string;
  dotClassName: string;
  borderClassName: string;
  borderColor: string;
  headerClassName: string;
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
    description: "primeiro contato",
    subtitle: "D+1–2",
    dotClassName: "bg-blue-500",
    borderClassName: "border-l-blue-500",
    borderColor: "#3B82F6",
    headerClassName: "text-blue-800",
    badgeClassName: "bg-blue-100 text-blue-800",
  },
  broken_promise: {
    code: "broken_promise",
    label: "Promessa quebrada",
    sublabel: "Prometeu pagar e não cumpriu",
    description: "Prometeu pagar e não cumpriu",
    subtitle: "",
    dotClassName: "bg-red-500",
    borderClassName: "border-l-red-600",
    borderColor: "#DC2626",
    headerClassName: "text-red-700",
    badgeClassName: "bg-red-100 text-red-700",
  },
  fpd: {
    code: "fpd",
    label: "FPD",
    sublabel: "Inadimplência do 1º pagamento",
    description: "Inadimplência do 1º pagamento",
    subtitle: "",
    dotClassName: "bg-red-500",
    borderClassName: "border-l-red-600",
    borderColor: "#DC2626",
    headerClassName: "text-red-700",
    badgeClassName: "bg-red-100 text-red-700",
  },
  early: {
    code: "early",
    label: "Atraso D+2–5",
    sublabel: "Atraso inicial · contato",
    description: "Atraso inicial · contato",
    subtitle: "",
    dotClassName: "bg-amber-500",
    borderClassName: "border-l-amber-600",
    borderColor: "#D97706",
    headerClassName: "text-amber-800",
    badgeClassName: "bg-amber-100 text-amber-800",
  },
  mid: {
    code: "mid",
    label: "Atraso D+6–15",
    sublabel: "Atraso médio · visita necessária",
    description: "Atraso médio · visita necessária",
    subtitle: "",
    dotClassName: "bg-amber-500",
    borderClassName: "border-l-amber-600",
    borderColor: "#D97706",
    headerClassName: "text-amber-800",
    badgeClassName: "bg-amber-100 text-amber-800",
  },
  late: {
    code: "late",
    label: "Pós carta D+15",
    sublabel: "Pós carta · aviso de negativação",
    description: "Pós carta · aviso de negativação",
    subtitle: "",
    dotClassName: "bg-orange-500",
    borderClassName: "border-l-orange-600",
    borderColor: "#EA580C",
    headerClassName: "text-orange-800",
    badgeClassName: "bg-orange-100 text-orange-800",
  },
  critical: {
    code: "critical",
    label: "Risco negativação",
    sublabel: "D+20+ · iminente negativação",
    description: "D+20+ · iminente negativação",
    subtitle: "D+20+",
    dotClassName: "bg-purple-500",
    borderClassName: "border-l-purple-600",
    borderColor: "#7C3AED",
    headerClassName: "text-purple-800",
    badgeClassName: "bg-purple-100 text-purple-800",
  },
};

export function getChargeQueueSegmentMeta(
  code: ChargeQueueSegmentCode,
): ChargeQueueSegmentMeta {
  return SEGMENT_META[code];
}

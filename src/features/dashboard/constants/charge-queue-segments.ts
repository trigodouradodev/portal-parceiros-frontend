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
  subtitle: string;
  description: string;
  dotClassName: string;
  borderClassName: string;
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
    subtitle: "D+1–2",
    description: "primeiro contato",
    dotClassName: "bg-[#1D9E75]",
    borderClassName: "border-l-[#1D9E75]",
    headerClassName: "text-[#1D9E75]",
    badgeClassName: "bg-[#E6F7F1] text-[#1D9E75]",
  },
  broken_promise: {
    code: "broken_promise",
    label: "Promessa quebrada",
    subtitle: "",
    description: "promessa não cumprida",
    dotClassName: "bg-[#D84040]",
    borderClassName: "border-l-[#D84040]",
    headerClassName: "text-[#D84040]",
    badgeClassName: "bg-destructive-bg text-destructive",
  },
  fpd: {
    code: "fpd",
    label: "FPD",
    subtitle: "",
    description: "Inadimplência do 1º pagamento",
    dotClassName: "bg-[#D84040]",
    borderClassName: "border-l-[#378ADD]",
    headerClassName: "text-[#378ADD]",
    badgeClassName: "bg-[#E8F0FB] text-[#378ADD]",
  },
  early: {
    code: "early",
    label: "Atraso D+2–5",
    subtitle: "",
    description: "Atraso inicial — contato",
    dotClassName: "bg-[#E5A000]",
    borderClassName: "border-l-[#E5A000]",
    headerClassName: "text-[#BA7517]",
    badgeClassName: "bg-warning-bg text-warning",
  },
  mid: {
    code: "mid",
    label: "Atraso D+8–15",
    subtitle: "",
    description: "Atraso médio — visita necessária",
    dotClassName: "bg-[#E5A000]",
    borderClassName: "border-l-[#BA7517]",
    headerClassName: "text-[#BA7517]",
    badgeClassName: "bg-warning-bg text-warning",
  },
  late: {
    code: "late",
    label: "Pós carta D+15",
    subtitle: "",
    description: "Pós carta — aviso de negativação",
    dotClassName: "bg-[#BA7517]",
    borderClassName: "border-l-[#BA7517]",
    headerClassName: "text-[#BA7517]",
    badgeClassName: "bg-warning-bg text-warning",
  },
  critical: {
    code: "critical",
    label: "Risco negativação",
    subtitle: "D+20+",
    description: "Iminente negativação",
    dotClassName: "bg-[#7B61FF]",
    borderClassName: "border-l-[#7B61FF]",
    headerClassName: "text-[#7B61FF]",
    badgeClassName: "bg-[#F0EDFF] text-[#7B61FF]",
  },
};

export function getChargeQueueSegmentMeta(
  code: ChargeQueueSegmentCode,
): ChargeQueueSegmentMeta {
  return SEGMENT_META[code];
}

export type CobrStage =
  | "initial"
  | "no_return_1"
  | "second_attempt"
  | "no_return_2"
  | "third_attempt"
  | "sem_previsao"
  | "promise"
  | "fup"
  | "paid";

export type ActivityType = "phone" | "visit";

export interface PrevClient {
  id: string;
  name: string;
  contract: string;
  parcela: string;
  value: number;
  daysUntilDue: number;
  phone: string;
  activityType: ActivityType;
}

export interface CobrClient {
  id: string;
  name: string;
  contract: string;
  parcela: string;
  value: number;
  overdueDays: number;
  phone: string;
  activityType: ActivityType;
  stage: CobrStage;
  lastAction: string | null;
}

export const prevClients: PrevClient[] = [
  {
    id: "p1",
    name: "Carlos Mendes",
    contract: "Contrato #0043",
    parcela: "Parc 2/6",
    value: 1250,
    daysUntilDue: 5,
    phone: "(11) 99432-1870",
    activityType: "phone",
  },
  {
    id: "p2",
    name: "Ana Beatriz Souza",
    contract: "Contrato #0081",
    parcela: "Parc 1/6",
    value: 890,
    daysUntilDue: 5,
    phone: "(21) 98811-4400",
    activityType: "phone",
  },
  {
    id: "p3",
    name: "Roberto Lima",
    contract: "Contrato #0027",
    parcela: "Parc 5/6",
    value: 3400,
    daysUntilDue: 2,
    phone: "(31) 99100-2230",
    activityType: "visit",
  },
  {
    id: "p4",
    name: "Mariana Santos",
    contract: "Contrato #0059",
    parcela: "Parc 3/6",
    value: 650,
    daysUntilDue: 0,
    phone: "(41) 98765-1199",
    activityType: "phone",
  },
  {
    id: "p5",
    name: "Paulo Ferreira",
    contract: "Contrato #0014",
    parcela: "Parc 7/7",
    value: 2100,
    daysUntilDue: 0,
    phone: "(61) 99203-5588",
    activityType: "phone",
  },
];

export const cobrClients: CobrClient[] = [
  {
    id: "c1",
    name: "Ricardo Alves",
    contract: "Contrato #0009",
    parcela: "Parc 9/10",
    value: 5600,
    overdueDays: 32,
    phone: "(11) 99400-7722",
    activityType: "visit",
    stage: "fup",
    lastAction: "Boleto emitido · Promessa para 22/05",
  },
  {
    id: "c2",
    name: "João da Silva",
    contract: "Contrato #0032",
    parcela: "Parc 4/8",
    value: 1800,
    overdueDays: 15,
    phone: "(11) 97700-4433",
    activityType: "phone",
    stage: "second_attempt",
    lastAction: "1ª tentativa sem retorno · 18/05",
  },
  {
    id: "c3",
    name: "Fernanda Costa",
    contract: "Contrato #0065",
    parcela: "Parc 2/6",
    value: 450,
    overdueDays: 8,
    phone: "(19) 98832-0011",
    activityType: "phone",
    stage: "initial",
    lastAction: "Sem atendimento · 17/05",
  },
  {
    id: "c4",
    name: "Lúcia Barros",
    contract: "Contrato #0073",
    parcela: "Parc 1/6",
    value: 920,
    overdueDays: 3,
    phone: "(85) 98900-3344",
    activityType: "phone",
    stage: "initial",
    lastAction: null,
  },
];

export const STAGE_INFO: Record<
  CobrStage,
  { label: string; color: string; journeyPath: string[] }
> = {
  initial: {
    label: "Ligação inicial",
    color: "blue",
    journeyPath: ["Ligação"],
  },
  no_return_1: {
    label: "Sem retorno (1ª)",
    color: "amber",
    journeyPath: ["Ligação", "Sem retorno"],
  },
  second_attempt: {
    label: "2ª Tentativa",
    color: "amber",
    journeyPath: ["Ligação", "Sem retorno", "2ª Tentativa"],
  },
  no_return_2: {
    label: "Sem retorno (2ª)",
    color: "red",
    journeyPath: ["Ligação", "Sem retorno", "2ª Tentativa", "Sem retorno"],
  },
  third_attempt: {
    label: "3ª Tentativa",
    color: "red",
    journeyPath: [
      "Ligação",
      "Sem retorno",
      "2ª Tentativa",
      "Sem retorno",
      "3ª Tentativa",
    ],
  },
  sem_previsao: {
    label: "Sem Previsão",
    color: "gray",
    journeyPath: ["Ligação", "Sem Previsão"],
  },
  promise: {
    label: "Promessa de Pagamento",
    color: "teal",
    journeyPath: ["Ligação", "Promessa"],
  },
  fup: {
    label: "FUP de Promessa",
    color: "amber",
    journeyPath: ["Ligação", "Promessa", "Boleto", "FUP"],
  },
  paid: {
    label: "Pago ✓",
    color: "green",
    journeyPath: ["Ligação", "Promessa", "Boleto", "FUP", "Pago"],
  },
};

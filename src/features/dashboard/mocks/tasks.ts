export type ChargeStage =
  | "initial"
  | "no_return_1"
  | "second_attempt"
  | "no_return_2"
  | "third_attempt"
  | "sem_previsao"
  | "promise"
  | "fup"
  | "paid";

import type { ClientAddress } from "@/services/dashboard/dashboard.types";

export type ActivityType = "phone" | "visit";

export interface PrevClient {
  id: string;
  installmentId?: string;
  name: string;
  contract: string;
  parcela: string;
  value: number;
  daysUntilDue: number;
  installmentNumber: number;
  followupCount: number;
  phone: string;
  address?: ClientAddress;
  activityType: ActivityType;
}

export interface ChargeClient {
  id: string;
  name: string;
  contract: string;
  parcela: string;
  value: number;
  overdueDays: number;
  phone: string;
  address?: ClientAddress;
  activityType: ActivityType;
  stage: ChargeStage;
  lastAction: string | null;
  reguaBadge?: { label: string; color: string };
}

import { createContext, useContext } from "react";
import type { ChargeStage } from "@/features/dashboard/mocks/tasks";
import type { TaskTab } from "@/features/dashboard/constants/task-tab";
import {
  ActivityChannel,
  type ClientAddress,
} from "@/services/dashboard/dashboard.types";
import type { QueueTone } from "@/services/activities/activity.enums";

export type ActionMode = TaskTab;

export type PreventiveContactType = "phone" | "visit" | "whatsapp";

export interface ActionClient {
  /** contractId */
  id: string;
  installmentNumber: number;
  name: string;
  contract: string;
  parcela: string;
  value: string;
  currentStep: string;
  daysInfo: string;
  phone?: string;
  address?: ClientAddress;
}

export interface ActionResult {
  nextStage?: ChargeStage;
  channel?: string;
  outcome?: string;
  note?: string;
  status?: string;
}

export interface SetActionDataPayload {
  client: ActionClient;
  mode: ActionMode;
  chargeStage?: ChargeStage;
  taskId?: string;
  taskChannel?: ActivityChannel;
  installmentId?: string;
  contactType?: PreventiveContactType;
  queueTone?: QueueTone | string;
  onComplete: (result: ActionResult) => void;
}

export interface ActionContextType {
  client: ActionClient | null;
  mode: ActionMode | null;
  chargeStage?: ChargeStage;
  taskId?: string;
  taskChannel?: ActivityChannel;
  installmentId?: string;
  contactType?: PreventiveContactType;
  queueTone?: QueueTone | string;
  onComplete: (result: ActionResult) => void;
  setActionData: (data: SetActionDataPayload) => void;
  clearActionData: () => void;
}

export const ActionContext = createContext<ActionContextType | undefined>(
  undefined,
);

export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (context === undefined) {
    throw new Error("useActionContext must be used within an ActionProvider");
  }
  return context;
};

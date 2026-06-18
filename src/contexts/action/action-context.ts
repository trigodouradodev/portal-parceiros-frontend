import { createContext, useContext } from "react";
import type { CobrStage } from "@/features/dashboard/mocks/tasks";

export type ActionMode = "cobr" | "prev";

export type PreventiveContactType = "phone" | "visit" | "whatsapp";

export interface ActionClient {
  /** contractId */
  id: string;
  name: string;
  contract: string;
  parcela: string;
  value: string;
  currentStep: string;
  daysInfo: string;
  phone?: string;
  address?: string;
}

export interface ActionResult {
  nextStage?: CobrStage;
  channel?: string;
  outcome?: string;
  note?: string;
  status?: string;
}

export interface SetActionDataPayload {
  client: ActionClient;
  mode: ActionMode;
  cobrStage?: CobrStage;
  contactType?: PreventiveContactType;
  onComplete: (result: ActionResult) => void;
}

export interface ActionContextType {
  client: ActionClient | null;
  mode: ActionMode | null;
  cobrStage?: CobrStage;
  contactType?: PreventiveContactType;
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

import { useState, type ReactNode } from "react";
import type { ChargeStage } from "@/features/dashboard/mocks/tasks";
import {
  ActionContext,
  type ActionClient,
  type ActionMode,
  type ActionResult,
  type SetActionDataPayload,
  type PreventiveContactType,
} from "@/contexts/action/action-context";

export function ActionProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ActionClient | null>(null);
  const [mode, setMode] = useState<ActionMode | null>(null);
  const [chargeStage, setChargeStage] = useState<ChargeStage | undefined>(
    undefined,
  );
  const [contactType, setContactType] = useState<
    PreventiveContactType | undefined
  >(undefined);
  const [onComplete, setOnComplete] = useState<(result: ActionResult) => void>(
    () => () => {},
  );

  function setActionData(data: SetActionDataPayload) {
    setClient(data.client);
    setMode(data.mode);
    setChargeStage(data.chargeStage);
    setContactType(data.contactType);
    setOnComplete(() => data.onComplete);
  }

  function clearActionData() {
    setClient(null);
    setMode(null);
    setChargeStage(undefined);
    setContactType(undefined);
    setOnComplete(() => () => {});
  }

  return (
    <ActionContext.Provider
      value={{
        client,
        mode,
        chargeStage,
        contactType,
        onComplete,
        setActionData,
        clearActionData,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
}

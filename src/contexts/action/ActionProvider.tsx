import { useState, type ReactNode } from "react";
import type { CobrStage } from "@/features/dashboard/mocks/tasks";
import {
  ActionContext,
  type ActionClient,
  type ActionMode,
  type ActionResult,
  type SetActionDataPayload,
} from "@/contexts/action/action-context";

export function ActionProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ActionClient | null>(null);
  const [mode, setMode] = useState<ActionMode | null>(null);
  const [cobrStage, setCobrStage] = useState<CobrStage | undefined>(undefined);
  const [contactType, setContactType] = useState<"phone" | "visit" | undefined>(
    undefined,
  );
  const [onComplete, setOnComplete] = useState<(result: ActionResult) => void>(
    () => () => {},
  );

  function setActionData(data: SetActionDataPayload) {
    setClient(data.client);
    setMode(data.mode);
    setCobrStage(data.cobrStage);
    setContactType(data.contactType);
    setOnComplete(() => data.onComplete);
  }

  function clearActionData() {
    setClient(null);
    setMode(null);
    setCobrStage(undefined);
    setContactType(undefined);
    setOnComplete(() => () => {});
  }

  return (
    <ActionContext.Provider
      value={{
        client,
        mode,
        cobrStage,
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

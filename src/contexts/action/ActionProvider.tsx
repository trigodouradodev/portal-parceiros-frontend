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
import type { ActivityChannel } from "@/services/dashboard/dashboard.types";

export function ActionProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ActionClient | null>(null);
  const [mode, setMode] = useState<ActionMode | null>(null);
  const [chargeStage, setChargeStage] = useState<ChargeStage | undefined>(
    undefined,
  );
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const [taskChannel, setTaskChannel] = useState<ActivityChannel | undefined>(
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
    setTaskId(data.taskId);
    setTaskChannel(data.taskChannel);
    setContactType(data.contactType);
    setOnComplete(() => data.onComplete);
  }

  function clearActionData() {
    setClient(null);
    setMode(null);
    setChargeStage(undefined);
    setTaskId(undefined);
    setTaskChannel(undefined);
    setContactType(undefined);
    setOnComplete(() => () => {});
  }

  return (
    <ActionContext.Provider
      value={{
        client,
        mode,
        chargeStage,
        taskId,
        taskChannel,
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

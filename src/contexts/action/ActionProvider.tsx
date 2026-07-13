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
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

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
  const [installmentId, setInstallmentId] = useState<string | undefined>(
    undefined,
  );
  const [contactType, setContactType] = useState<
    PreventiveContactType | undefined
  >(undefined);
  const [queueTone, setQueueTone] = useState<string | undefined>(undefined);
  const [onComplete, setOnComplete] = useState<(result: ActionResult) => void>(
    () => () => {},
  );

  function setActionData(data: SetActionDataPayload) {
    setClient(data.client);
    setMode(data.mode);
    setChargeStage(data.chargeStage);
    setTaskId(data.taskId);
    setTaskChannel(data.taskChannel);
    setInstallmentId(data.installmentId);
    setContactType(data.contactType);
    setQueueTone(data.queueTone);
    setOnComplete(() => data.onComplete);
  }

  function clearActionData() {
    setClient(null);
    setMode(null);
    setChargeStage(undefined);
    setTaskId(undefined);
    setTaskChannel(undefined);
    setInstallmentId(undefined);
    setContactType(undefined);
    setQueueTone(undefined);
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
        installmentId,
        contactType,
        queueTone,
        onComplete,
        setActionData,
        clearActionData,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
}

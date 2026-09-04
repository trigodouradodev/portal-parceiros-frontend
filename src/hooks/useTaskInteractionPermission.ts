import { useCallback } from "react";
import { isAfter, isValid, parseISO, startOfDay } from "date-fns";
import { useAuth } from "@/contexts/auth/auth-context";
import { ActivityTaskStatus } from "@/services/activities/activity.enums";
import type { ActivityTaskSummary } from "@/services/dashboard/dashboard.types";

export interface TaskInteractionCandidate {
  isActive?: boolean;
  assignedTo?: { id: string } | null;
}

export interface ScheduledEarlyExecutionCandidate extends TaskInteractionCandidate {
  expireDate?: string;
  task?: Pick<ActivityTaskSummary, "status"> | null;
}

export function canInteractWithTask(
  task: TaskInteractionCandidate | null | undefined,
  currentUserId?: string,
) {
  return Boolean(task?.isActive && task.assignedTo?.id === currentUserId);
}

/**
 * Regra deliberadamente separada da permissão padrão da fila. Ela só dá
 * suporte ao CTA de antecipação dentro de "Agendadas"; não desbloqueia a
 * tarefa para as demais ações da fila.
 */
export function canExecuteScheduledTaskEarly(
  item: ScheduledEarlyExecutionCandidate | null | undefined,
  currentUserId?: string,
  referenceDate = new Date(),
) {
  if (
    !item ||
    item.isActive !== false ||
    item.task?.status !== ActivityTaskStatus.PENDING ||
    item.assignedTo?.id !== currentUserId ||
    !item.expireDate
  ) {
    return false;
  }

  const scheduledDate = parseISO(item.expireDate);
  return (
    isValid(scheduledDate) &&
    isAfter(startOfDay(scheduledDate), startOfDay(referenceDate))
  );
}

/**
 * A tarefa pode ser visualizada por qualquer usuário autorizado, mas só pode
 * expor interações quando está ativa e atribuída ao usuário autenticado.
 */
export function useTaskInteractionPermission() {
  const { user } = useAuth();

  return useCallback(
    (task: TaskInteractionCandidate | null | undefined) =>
      canInteractWithTask(task, user?.id),
    [user?.id],
  );
}

export function useScheduledEarlyExecutionPermission() {
  const { user } = useAuth();

  return useCallback(
    (item: ScheduledEarlyExecutionCandidate | null | undefined) =>
      canExecuteScheduledTaskEarly(item, user?.id),
    [user?.id],
  );
}

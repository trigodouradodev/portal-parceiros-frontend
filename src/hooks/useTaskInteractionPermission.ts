import { useCallback } from "react";
import { isAfter, isValid, parseISO, startOfDay } from "date-fns";
import { useAuth } from "@/contexts/auth/auth-context";
import { ActivityTaskStatus } from "@/services/activities/activity.enums";

export interface TaskInteractionCandidate {
  isActive?: boolean;
  assignedTo?: { id: string } | null;
}

export interface ScheduledEarlyExecutionCandidate extends TaskInteractionCandidate {
  status?: string;
  expireDate?: string;
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
  task: ScheduledEarlyExecutionCandidate | null | undefined,
  currentUserId?: string,
  referenceDate = new Date(),
) {
  if (
    !task ||
    task.isActive !== false ||
    task.status !== ActivityTaskStatus.PENDING ||
    task.assignedTo?.id !== currentUserId ||
    !task.expireDate
  ) {
    return false;
  }

  const scheduledDate = parseISO(task.expireDate);
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
    (task: ScheduledEarlyExecutionCandidate | null | undefined) =>
      canExecuteScheduledTaskEarly(task, user?.id),
    [user?.id],
  );
}

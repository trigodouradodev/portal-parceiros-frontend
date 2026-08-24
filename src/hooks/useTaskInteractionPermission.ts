import { useCallback } from "react";
import { useAuth } from "@/contexts/auth/auth-context";

export interface TaskInteractionCandidate {
  isActive?: boolean;
  assignedTo?: { id: string } | null;
}

export function canInteractWithTask(
  task: TaskInteractionCandidate | null | undefined,
  currentUserId?: string,
) {
  return Boolean(task?.isActive && task.assignedTo?.id === currentUserId);
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

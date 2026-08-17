import { getApiErrorMessage } from "@/lib/api/errors";

const TASK_ACTION_ERROR_MESSAGES: Record<string, string> = {
  already_postponed: "Esta tarefa já foi postergada.",
  already_rescheduled: "Esta visita já foi reagendada.",
  reschedule_visit_only: "Só é possível reagendar tarefas de visita.",
  reschedule_out_of_window:
    "Escolha uma data entre amanhã e D+5 a partir de hoje.",
  task_not_found: "Tarefa não encontrada.",
};

export function getTaskActionErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const raw = getApiErrorMessage(err, fallback);
  return TASK_ACTION_ERROR_MESSAGES[raw] ?? raw;
}

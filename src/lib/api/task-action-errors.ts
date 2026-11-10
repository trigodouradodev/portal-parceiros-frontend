import { getApiErrorMessage } from "@/lib/api/errors";
import { isAxiosError } from "axios";

const TASK_ACTION_ERROR_MESSAGES: Record<string, string> = {
  no_forecast_reason_required: "Selecione o motivo da falta de previsão.",
  no_forecast_reason_invalid:
    "Selecione um motivo válido para a falta de previsão.",
  no_forecast_reason_not_allowed:
    "O motivo só se aplica ao resultado Sem previsão.",
  already_postponed: "Esta tarefa já foi postergada.",
  already_rescheduled: "Esta visita já foi reagendada.",
  reschedule_visit_only: "Só é possível reagendar tarefas de visita.",
  reschedule_out_of_window:
    "Escolha uma data entre amanhã e D+5 a partir de hoje.",
  task_not_found: "Tarefa não encontrada.",
  task_not_pending:
    "Esta tarefa já foi concluída ou encerrada. Sua fila foi atualizada.",
  task_not_active:
    "Esta tarefa não está mais disponível no segmento atual. Sua fila foi atualizada.",
  expected_agreement_date_required:
    "Informe a data prevista para fechar o acordo.",
  expected_agreement_date_out_of_window:
    "Escolha uma data entre amanhã e os próximos 10 dias para fechar o acordo.",
  expected_agreement_date_unexpected:
    "A data prevista para o acordo só se aplica à renegociação.",
};

const COLLECTION_REASON_MESSAGES: Record<string, string> = {
  open_pending_action:
    "Este contrato tem uma ação pendente com o backoffice. A cobrança está suspensa.",
  reference_changed: "A parcela de referência mudou. Sua fila foi atualizada.",
  three_or_more_overdue_installments:
    "Este contrato tem três ou mais parcelas atrasadas e está fora da régua de cobrança.",
  no_overdue_installments:
    "Este contrato não tem parcelas atrasadas para cobrar.",
  collection_blocked: "A cobrança desta parcela está suspensa.",
  second_overdue_follow_up_completed:
    "O acompanhamento das duas parcelas atrasadas já foi concluído.",
  visit_interval:
    "Este contrato está no intervalo após a visita. Sua fila foi atualizada.",
  active_payment_promise:
    "Este contrato tem uma promessa de pagamento vigente.",
  recipient_must_be_guarantor:
    "O cliente está marcado como falecido. Direcione a cobrança ao avalista.",
  no_living_guarantor: "Não há avalista disponível para receber esta cobrança.",
  no_living_recipient: "Não há destinatário disponível para esta cobrança.",
};

export function isStaleTaskError(err: unknown): boolean {
  return [
    "task_not_collectible",
    "task_not_pending",
    "task_not_found",
    "task_not_active",
  ].includes(getApiErrorMessage(err, ""));
}

export function getTaskActionErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const raw = getApiErrorMessage(err, fallback);
  if (raw === "task_not_collectible") {
    const data = isAxiosError(err)
      ? (err.response?.data as { reason?: string })
      : undefined;
    return (
      COLLECTION_REASON_MESSAGES[data?.reason ?? ""] ??
      "A situação deste contrato mudou. Sua fila foi atualizada."
    );
  }
  return TASK_ACTION_ERROR_MESSAGES[raw] ?? raw;
}

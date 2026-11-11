import { AxiosError } from "axios";
import {
  getTaskActionErrorMessage,
  isStaleTaskError,
} from "@/lib/api/task-action-errors";

function axiosError(message: string, reason?: string) {
  return new AxiosError("error", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 400,
    data: { message, reason },
    statusText: "Bad Request",
    headers: {},
    config: { headers: {} as never },
  });
}

describe("getTaskActionErrorMessage", () => {
  it("traduz o motivo de inelegibilidade e sinaliza atualização da fila", () => {
    const error = axiosError("task_not_collectible", "open_pending_action");
    expect(getTaskActionErrorMessage(error, "fallback")).toContain(
      "backoffice",
    );
    expect(isStaleTaskError(error)).toBe(true);
    expect(
      isStaleTaskError(axiosError("expected_agreement_date_required")),
    ).toBe(false);
  });
  it("maps known task action codes", () => {
    expect(
      getTaskActionErrorMessage(axiosError("already_postponed"), "fallback"),
    ).toBe("Esta tarefa já foi postergada.");
    expect(
      getTaskActionErrorMessage(axiosError("already_rescheduled"), "fallback"),
    ).toBe("Esta visita já foi reagendada.");
    expect(
      getTaskActionErrorMessage(
        axiosError("reschedule_visit_only"),
        "fallback",
      ),
    ).toBe("Só é possível reagendar tarefas de visita.");
  });

  it("falls back to API message or default", () => {
    expect(
      getTaskActionErrorMessage(axiosError("custom_error"), "fallback"),
    ).toBe("custom_error");
    expect(getTaskActionErrorMessage(new Error("x"), "fallback")).toBe(
      "fallback",
    );
  });
});

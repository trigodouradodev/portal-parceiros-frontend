import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScheduledTaskCard } from "@/features/dashboard/components/task-cards/ScheduledTaskCard";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import { renderWithProviders } from "@/test/render";

const display = {
  client: {
    name: "Maria Silva",
    overdueDays: 10,
    value: 500,
    contract: "123",
    parcela: "Parcela 2",
  },
  segment: {
    code: "mid",
    label: "Atraso médio",
    sublabel: "D+6–15",
    dotClassName: "bg-amber-500",
    borderColor: "#D97706",
    badgeClassName: "bg-amber-100 text-amber-800",
  },
  queuePosition: 1,
  originalAmount: 500,
  correctedAmount: 500,
  overdueInstallmentCount: 1,
  consolidatedOverdueAmount: 500,
  tone: "friendly",
  toneLabel: "Contato",
  pendingActionLabel: "Visita",
  contractSubtitle: "Contrato #123 · D+6–15",
  contractLabel: "#123",
  wasPostponed: false,
  wasRescheduled: true,
  rescheduleCount: 1,
} as ChargeQueueDisplayItem;

describe("ScheduledTaskCard", () => {
  it("offers early execution without exposing queue actions", async () => {
    const user = userEvent.setup();
    const onExecuteNow = vi.fn();

    renderWithProviders(
      <ScheduledTaskCard
        display={display}
        scheduledDate="2026-09-09"
        onOpen={vi.fn()}
        onCollapse={vi.fn()}
        onExecuteNow={onExecuteNow}
      />,
    );

    expect(screen.getByText("Agendada para 09/09/2026")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Executar agora" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Postergar|Reagendar/ }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Executar agora" }));
    expect(onExecuteNow).toHaveBeenCalledOnce();
  });
});

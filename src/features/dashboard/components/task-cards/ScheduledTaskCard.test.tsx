import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScheduledTaskCard } from "@/features/dashboard/components/task-cards/ScheduledTaskCard";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";
import { renderWithProviders } from "@/test/render";

const item = {
  installment: {
    id: "installment-1",
    number: 2,
    label: "Parcela 2",
    dueDate: "2026-08-01",
    daysOverdue: 10,
    pendingAmount: 500,
    totalAmount: 500,
    status: "not_paid",
  },
  contract: { id: "contract-1", number: "123", totalInstallments: 12 },
  client: {
    name: "Maria Silva",
    taxId: "12345678901",
  },
  task: {
    id: "task-1",
    stageCode: "warning",
    stageBadgeLabel: "Visita",
    channel: "client_visit",
    status: "pending",
  },
  queueSegmentCode: "mid",
  queueTone: "friendly",
  expireDate: "2026-09-09",
  isActive: false,
  assignedTo: { id: "user-1", name: "Maria" },
} satisfies OverdueCollectionItem;

describe("ScheduledTaskCard", () => {
  it("keeps the action hidden until the card is expanded", async () => {
    const user = userEvent.setup();
    const onExecuteNow = vi.fn();

    renderWithProviders(
      <ScheduledTaskCard
        item={item}
        position={1}
        onOpen={vi.fn()}
        onExecuteNow={onExecuteNow}
      />,
    );

    expect(screen.queryByRole("button", { name: "Executar agora" })).toBeNull();

    await user.click(screen.getByRole("button", { name: /Maria Silva/ }));

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

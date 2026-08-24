import { render, screen } from "@testing-library/react";
import { ChargeQueueHeroCard } from "@/features/dashboard/components/task-cards/ChargeQueueHeroCard";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";

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
  pendingActionLabel: "Contato",
  contractSubtitle: "Contrato #123 · D+6–15",
  contractLabel: "#123",
  wasPostponed: false,
  wasRescheduled: false,
  rescheduleCount: 0,
} as ChargeQueueDisplayItem;

describe("ChargeQueueHeroCard", () => {
  it("shows task details without interaction controls in read-only mode", () => {
    render(
      <ChargeQueueHeroCard
        display={display}
        canPostpone
        canRescheduleVisit={false}
        onWhatsApp={vi.fn()}
        onCall={vi.fn()}
        onVisit={vi.fn()}
        onOpen={vi.fn()}
        onPostpone={vi.fn()}
        onRescheduleVisit={vi.fn()}
        readOnly
      />,
    );

    expect(screen.getByText("Maria Silva")).toBeVisible();
    expect(screen.queryByRole("button", { name: "WhatsApp" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ligar" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Postergar/ })).toBeNull();
  });
});

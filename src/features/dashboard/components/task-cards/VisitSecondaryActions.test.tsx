import { screen } from "@testing-library/react";
import { VisitSecondaryActions } from "@/features/dashboard/components/task-cards/VisitSecondaryActions";
import { renderWithProviders } from "@/test/render";

function renderActions(rescheduleCount: number) {
  return renderWithProviders(
    <VisitSecondaryActions
      canRescheduleVisit={rescheduleCount < 2}
      wasRescheduled={rescheduleCount > 0}
      rescheduleCount={rescheduleCount}
      canPostpone
      onOpenReschedule={vi.fn()}
      onPostponeClick={vi.fn()}
    />,
  );
}

describe("VisitSecondaryActions", () => {
  it("shows Agendar before the first visit scheduling", () => {
    renderActions(0);

    expect(screen.getByRole("button", { name: "Agendar" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Reagendar" }),
    ).not.toBeInTheDocument();
  });

  it("shows Reagendar as the last scheduling opportunity", () => {
    renderActions(1);

    expect(screen.getByRole("button", { name: "Reagendar" })).toBeVisible();
  });

  it("hides the scheduling button after the second use", () => {
    renderActions(2);

    expect(
      screen.queryByRole("button", { name: /Agendar|Reagendar/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Postergar/ })).toBeVisible();
  });
});

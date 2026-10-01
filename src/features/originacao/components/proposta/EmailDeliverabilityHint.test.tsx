import { render, screen } from "@testing-library/react";
import { EmailDeliverabilityHint } from "@/features/originacao/components/proposta/EmailDeliverabilityHint";
import { EmailDeliverabilityStatus } from "@/features/originacao/hooks/useEmailDeliverability";

describe("EmailDeliverabilityHint", () => {
  it.each([
    EmailDeliverabilityStatus.UNCHECKED,
    EmailDeliverabilityStatus.OK,
    EmailDeliverabilityStatus.BLOCKED,
  ])("renders nothing for status %s", (status) => {
    render(<EmailDeliverabilityHint status={status} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Verificando entregabilidade/),
    ).not.toBeInTheDocument();
  });

  it("shows a discreet checking indicator", () => {
    render(
      <EmailDeliverabilityHint status={EmailDeliverabilityStatus.CHECKING} />,
    );

    expect(
      screen.getByText("Verificando entregabilidade do e-mail…"),
    ).toBeInTheDocument();
  });

  it("shows a warning when the check could not be completed", () => {
    render(
      <EmailDeliverabilityHint
        status={EmailDeliverabilityStatus.UNAVAILABLE}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/Não foi possível verificar a entregabilidade/),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { RecipientPicker } from "./RecipientPicker";
import { ActivityRecipientType } from "@/services/activities/activity.enums";

describe("destinatários da cobrança", () => {
  it("desabilita cliente falecido e mantém o avalista vivo disponível", () => {
    render(
      <RecipientPicker
        value={ActivityRecipientType.GUARANTOR}
        onChange={vi.fn()}
        clientName="Maria"
        clientIsDeceased
        guarantor={{ name: "José", phone: "11999999999" }}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Cliente \/ Tomador/ }),
    ).toBeDisabled();
    expect(screen.getByText("Cliente falecido")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Avalista/ })).toBeEnabled();
  });

  it("desabilita também o avalista com óbito confirmado", () => {
    render(
      <RecipientPicker
        value={ActivityRecipientType.CLIENT}
        onChange={vi.fn()}
        clientName="Maria"
        guarantor={{ name: "José", phone: "11999999999", isDeceased: true }}
      />,
    );
    expect(screen.getByRole("button", { name: /Avalista/ })).toBeDisabled();
    expect(screen.getByText("Avalista falecido")).toBeInTheDocument();
  });
});

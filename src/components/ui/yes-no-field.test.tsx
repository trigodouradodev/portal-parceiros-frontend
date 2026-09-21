import { render, screen } from "@testing-library/react";
import { YesNoField } from "@/components/ui/yes-no-field";

describe("YesNoField", () => {
  it("does not show a hint when none is given", () => {
    render(
      <YesNoField label="Possui veículo?" value={null} onChange={vi.fn()} />,
    );

    expect(screen.queryByText(/./, { selector: "p" })).not.toBeInTheDocument();
  });

  it("shows the hint below the buttons when there is no error", () => {
    render(
      <YesNoField
        label="Sinais de urgência financeira"
        value={null}
        onChange={vi.fn()}
        hint="Indique se a pessoa demonstrou estar numa situação urgente."
      />,
    );

    expect(
      screen.getByText(
        "Indique se a pessoa demonstrou estar numa situação urgente.",
      ),
    ).toBeInTheDocument();
  });

  it("hides the hint while there is a validation error", () => {
    render(
      <YesNoField
        label="Sinais de urgência financeira"
        value={null}
        onChange={vi.fn()}
        hint="Indique se a pessoa demonstrou estar numa situação urgente."
        error="Campo obrigatório"
      />,
    );

    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Indique se a pessoa demonstrou estar numa situação urgente.",
      ),
    ).not.toBeInTheDocument();
  });
});

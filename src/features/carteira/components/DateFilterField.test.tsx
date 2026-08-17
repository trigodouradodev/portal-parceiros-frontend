import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { DateFilterField } from "@/features/carteira/components/DateFilterField";

function renderField(
  props: Partial<ComponentProps<typeof DateFilterField>> = {},
) {
  const onChange = vi.fn();
  render(
    <DateFilterField
      label="Data inicial"
      value=""
      onChange={onChange}
      dialogTitle="Data inicial de desembolso"
      dialogDescription="Filtra contratos desembolsados a partir desta data."
      {...props}
    />,
  );
  return { onChange };
}

describe("DateFilterField", () => {
  it("shows the label when empty and the formatted date when filled", () => {
    const { rerender } = render(
      <DateFilterField
        label="Data inicial"
        value=""
        onChange={vi.fn()}
        dialogTitle="Data inicial de desembolso"
        dialogDescription="Filtra contratos desembolsados a partir desta data."
      />,
    );

    expect(
      screen.getByRole("button", { name: "Data inicial de desembolso" }),
    ).toHaveTextContent("Data inicial");

    rerender(
      <DateFilterField
        label="Data inicial"
        value="2026-03-15"
        onChange={vi.fn()}
        dialogTitle="Data inicial de desembolso"
        dialogDescription="Filtra contratos desembolsados a partir desta data."
      />,
    );

    expect(
      screen.getByRole("button", { name: "Data inicial de desembolso" }),
    ).toHaveTextContent("15/03/2026");
  });

  it("confirms the selected day as an ISO calendar date", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({ value: "2026-03-15" });

    await user.click(
      screen.getByRole("button", { name: "Data inicial de desembolso" }),
    );
    await user.click(screen.getByRole("button", { name: "20" }));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onChange).toHaveBeenCalledWith("2026-03-20");
  });

  it("clears a confirmed value", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({ value: "2026-03-15" });

    await user.click(
      screen.getByRole("button", { name: "Data inicial de desembolso" }),
    );
    await user.click(screen.getByRole("button", { name: "Limpar" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});

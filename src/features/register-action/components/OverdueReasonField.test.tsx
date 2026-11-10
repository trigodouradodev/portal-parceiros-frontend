import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverdueReasonField } from "./OverdueReasonField";
import {
  OVERDUE_REASON_OPTIONS,
  type OverdueReason,
} from "@/lib/overdue-reasons";

function Harness() {
  const [value, setValue] = useState<OverdueReason>();
  return <OverdueReasonField value={value} onChange={setValue} />;
}

it("usa o seletor padrão com os 24 motivos e busca sem acentos", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  expect(
    screen.getByText("Selecione o motivo para continuar."),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Selecione o motivo" }));
  expect(OVERDUE_REASON_OPTIONS).toHaveLength(24);
  expect(
    screen.queryByRole("button", { name: "Falecimento" }),
  ).not.toBeInTheDocument();
  for (const { label } of OVERDUE_REASON_OPTIONS)
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  await user.type(screen.getByPlaceholderText("Buscar..."), "vitima");
  expect(
    screen.queryByRole("button", { name: "Endividamento" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Vítima de golpe/fraude" }),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(
    screen.queryByText("Selecione o motivo para continuar."),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Vítima de golpe/fraude" }),
  ).toBeInTheDocument();
});

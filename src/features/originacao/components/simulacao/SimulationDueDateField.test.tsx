import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { SimulationFormValues } from "@/features/originacao/schemas/simulation-form";
import { renderWithProviders } from "@/test/render";
import { SimulationDueDateField } from "./SimulationDueDateField";

// Hoje = 25/03/2026: a janela vai de 14/04 a 09/05 (hoje + 20 a hoje + 45).
const TODAY = new Date(2026, 2, 25);

function Harness({ dueDate }: { dueDate?: Date }) {
  const form = useForm<SimulationFormValues>({
    defaultValues: { dueDate } as Partial<SimulationFormValues>,
  });
  return (
    <FormProvider {...form}>
      <SimulationDueDateField today={TODAY} />
    </FormProvider>
  );
}

function dayButton(label: string, month: string) {
  // O DayPicker nomeia cada dia como "<dia da semana>, <dia> de <mês> de <ano>".
  return screen.getByRole("button", {
    name: new RegExp(`^[^,]+, ${label} de ${month} de 2026`),
  });
}

describe("SimulationDueDateField (AUREA-721)", () => {
  it("explica a regra no campo", () => {
    renderWithProviders(<Harness />);
    expect(
      screen.getByText(/dia de 1 a 20, de 20 a 45 dias a partir de hoje/),
    ).toBeInTheDocument();
  });

  it("abre no primeiro mês com datas livres e libera só os dias de 1 a 20 da janela", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole("button", { name: /Selecionar data/ }));

    // Primeiro dia aceito (hoje + 20) e o último dia 20 do mês.
    expect(dayButton("14", "abril")).toBeEnabled();
    expect(dayButton("20", "abril")).toBeEnabled();
    // Um dia antes do mínimo e um dia alto, dentro da janela.
    expect(dayButton("13", "abril")).toBeDisabled();
    expect(dayButton("21", "abril")).toBeDisabled();
    expect(dayButton("30", "abril")).toBeDisabled();
  });
});

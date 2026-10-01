import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import type { SelectOption } from "@/components/ui/select-option";

const SHORT_OPTIONS: SelectOption[] = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
];

const LONG_OPTIONS: SelectOption[] = [
  { value: "retail_commerce", label: "Comércio / Varejo" },
  { value: "food", label: "Alimentação" },
  { value: "agriculture_rural", label: "Agro / Rural" },
  { value: "construction", label: "Construção Civil" },
  { value: "transportation", label: "Transporte" },
  { value: "health_and_care", label: "Saúde e Cuidados" },
  { value: "education", label: "Educação" },
  { value: "beauty_and_aesthetics", label: "Beleza e Estética" },
  { value: "automotive", label: "Automotivo" },
  { value: "industry_and_logistics", label: "Indústria / Logística" },
];

function Harness({
  options,
  hint,
}: {
  options: SelectOption[];
  hint?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <SelectDialogField
      label="Ramo de atividade"
      value={value}
      onChange={setValue}
      options={options}
      hint={hint}
    />
  );
}

describe("SelectDialogField", () => {
  it("does not show a search field for short option lists", () => {
    render(<Harness options={SHORT_OPTIONS} />);
    fireEvent.click(screen.getByText("Selecione"));

    expect(screen.queryByPlaceholderText("Buscar...")).not.toBeInTheDocument();
    expect(screen.getByText("Masculino")).toBeInTheDocument();
  });

  it("shows a search field once the option list is long enough", () => {
    render(<Harness options={LONG_OPTIONS} />);
    fireEvent.click(screen.getByText("Selecione"));

    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("filters options by label as the user types, ignoring case and accents", () => {
    render(<Harness options={LONG_OPTIONS} />);
    fireEvent.click(screen.getByText("Selecione"));

    fireEvent.change(screen.getByPlaceholderText("Buscar..."), {
      target: { value: "educacao" },
    });

    expect(screen.getByText("Educação")).toBeInTheDocument();
    expect(screen.queryByText("Automotivo")).not.toBeInTheDocument();
    expect(screen.queryByText("Transporte")).not.toBeInTheDocument();
  });

  it("shows an empty-state message when nothing matches the search", () => {
    render(<Harness options={LONG_OPTIONS} />);
    fireEvent.click(screen.getByText("Selecione"));

    fireEvent.change(screen.getByPlaceholderText("Buscar..."), {
      target: { value: "xpto-inexistente" },
    });

    expect(
      screen.getByText("Nenhum resultado encontrado."),
    ).toBeInTheDocument();
  });

  it("resets the search when the dialog is reopened", () => {
    render(<Harness options={LONG_OPTIONS} />);
    fireEvent.click(screen.getByText("Selecione"));
    fireEvent.change(screen.getByPlaceholderText("Buscar..."), {
      target: { value: "educacao" },
    });
    fireEvent.click(screen.getByText("Educação"));

    fireEvent.click(screen.getByText("Educação"));

    expect(screen.getByPlaceholderText("Buscar...")).toHaveValue("");
    expect(screen.getByText("Automotivo")).toBeInTheDocument();
  });

  it("shows the hint below the trigger when there is no error", () => {
    render(
      <Harness
        options={SHORT_OPTIONS}
        hint="Refere-se apenas à renda declarada acima."
      />,
    );

    expect(
      screen.getByText("Refere-se apenas à renda declarada acima."),
    ).toBeInTheDocument();
  });
});

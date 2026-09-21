import { render, screen } from "@testing-library/react";
import { RepeatableGroup } from "@/features/originacao/components/proposta/RepeatableGroup";

describe("RepeatableGroup", () => {
  it("does not show a hint when none is given", () => {
    render(
      <RepeatableGroup
        title="Despesas pessoais"
        addLabel="Adicionar despesa"
        emptyLabel="Nenhuma despesa adicionada."
        isEmpty
        onAdd={vi.fn()}
      >
        {null}
      </RepeatableGroup>,
    );

    expect(screen.getByText("Nenhuma despesa adicionada.")).toBeInTheDocument();
  });

  it("shows the hint below the title when given", () => {
    render(
      <RepeatableGroup
        title="Empréstimos"
        hint="Empréstimos e financiamentos formais em aberto."
        addLabel="Adicionar empréstimo"
        emptyLabel="Nenhum empréstimo adicionado."
        isEmpty
        onAdd={vi.fn()}
      >
        {null}
      </RepeatableGroup>,
    );

    expect(
      screen.getByText("Empréstimos e financiamentos formais em aberto."),
    ).toBeInTheDocument();
  });
});

import { useForm } from "react-hook-form";
import { fireEvent, render, screen } from "@testing-library/react";
import { Form } from "@/components/ui/form";
import { FinancialSection } from "@/features/originacao/components/proposta/FinancialSection";
import {
  createEmptyProposalForm,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";

function renderFinancial() {
  function Harness() {
    const form = useForm<ProposalFormData>({
      defaultValues: createEmptyProposalForm(),
    });

    return (
      <Form {...form}>
        <FinancialSection />
      </Form>
    );
  }

  return render(<Harness />);
}

function fieldTrigger(name: string) {
  const root = document.getElementById(`field-${name}`);
  return root?.querySelector("button") ?? null;
}

describe("FinancialSection", () => {
  it("labels Categoria the same way as Valor and Descrição, in the header of a despesa card", () => {
    renderFinancial();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar despesa" }));

    // A categoria precisa de um rótulo de verdade (não só placeholder) pra
    // não ficar visualmente diferente de Valor/Descrição na mesma linha.
    const categoryField = document.getElementById(
      "field-financial.expenses.0.category",
    );
    expect(categoryField?.textContent).toContain("Categoria");
    expect(fieldTrigger("financial.expenses.0.category")).toBeTruthy();
    expect(
      document.getElementById("field-financial.expenses.0.amount")?.textContent,
    ).toContain("Valor");
    expect(
      document.getElementById("field-financial.expenses.0.description")
        ?.textContent,
    ).toContain("Descrição");
  });

  it("labels Instituição/Credor the same way as the other fields, in the header of an empréstimo card", () => {
    renderFinancial();
    fireEvent.click(
      screen.getByRole("button", { name: "Adicionar empréstimo" }),
    );

    const institutionField = document.getElementById(
      "field-financial.loans.0.institution",
    );
    expect(institutionField?.textContent).toContain("Instituição/Credor");
    expect(fieldTrigger("financial.loans.0.institution")).toBeTruthy();
  });
});

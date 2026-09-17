import { useForm } from "react-hook-form";
import { render } from "@testing-library/react";
import { Form } from "@/components/ui/form";
import { RegistrationSection } from "@/features/originacao/components/proposta/RegistrationSection";
import {
  createEmptyProposalForm,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { MaritalStatus } from "@/services/quotes/quotes.enums";

function renderRegistration() {
  function Harness() {
    const empty = createEmptyProposalForm();
    const form = useForm<ProposalFormData>({
      defaultValues: {
        ...empty,
        registration: {
          ...empty.registration,
          cpf: "111.444.777-35",
          maritalStatus: MaritalStatus.MARRIED,
          spouseCpf: "529.982.247-25",
        },
      },
    });

    return (
      <Form {...form}>
        <RegistrationSection product="Produto" rate={2.5} />
      </Form>
    );
  }

  return render(<Harness />);
}

function fieldInput(name: string) {
  const root = document.getElementById(`field-${name}`);
  return root?.querySelector("input") ?? null;
}

describe("RegistrationSection", () => {
  it("locks only the borrower CPF", () => {
    renderRegistration();

    expect(fieldInput("registration.cpf")).toBeDisabled();
    expect(fieldInput("registration.cpf")).toHaveValue("111.444.777-35");
    expect(fieldInput("registration.name")).toBeEnabled();
    expect(fieldInput("registration.spouseCpf")).toBeEnabled();
  });
});

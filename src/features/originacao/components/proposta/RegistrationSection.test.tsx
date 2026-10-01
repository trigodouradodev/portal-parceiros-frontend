import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { Form } from "@/components/ui/form";
import { RegistrationSection } from "@/features/originacao/components/proposta/RegistrationSection";
import {
  createEmptyProposalForm,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import {
  EmailDeliverabilityStatus,
  type EmailDeliverabilityStatus as EmailDeliverabilityStatusType,
} from "@/features/originacao/hooks/useEmailDeliverability";
import { MaritalStatus } from "@/services/quotes/quotes.enums";

function renderRegistration(
  emailDeliverabilityStatus: EmailDeliverabilityStatusType = EmailDeliverabilityStatus.UNCHECKED,
) {
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
        <RegistrationSection
          product="Produto"
          rate={2.5}
          emailDeliverabilityStatus={emailDeliverabilityStatus}
        />
      </Form>
    );
  }

  return render(<Harness />);
}

function fieldInput(name: string) {
  const root = document.getElementById(`field-${name}`);
  return root?.querySelector("input") ?? null;
}

function fieldTrigger(name: string) {
  const root = document.getElementById(`field-${name}`);
  return root?.querySelector("button") ?? null;
}

describe("RegistrationSection", () => {
  it("locks only the borrower CPF", () => {
    renderRegistration();

    expect(fieldInput("registration.cpf")).toBeDisabled();
    expect(fieldInput("registration.cpf")).toHaveValue("111.444.777-35");
    expect(fieldInput("registration.name")).toBeEnabled();
    expect(fieldInput("registration.spouseCpf")).toBeEnabled();
  });

  it("uses selects for household counts and hides government programs", () => {
    renderRegistration();

    expect(fieldTrigger("registration.childrenCount")).toBeTruthy();
    expect(fieldTrigger("registration.householdSize")).toBeTruthy();
    expect(fieldInput("registration.childrenCount")).toBeNull();
    expect(
      document.getElementById("field-registration.governmentPrograms"),
    ).toBeNull();
  });

  it("forwards the e-mail deliverability status to the hint below the field", () => {
    renderRegistration(EmailDeliverabilityStatus.CHECKING);

    expect(
      screen.getByText("Verificando entregabilidade do e-mail…"),
    ).toBeInTheDocument();
  });
});

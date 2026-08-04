import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OutcomeOptionList } from "@/features/register-action/components/OutcomeOptionList";
import { RegisterClientCard } from "@/features/register-action/components/RegisterClientCard";
import { VisitDistanceLabel } from "@/features/register-action/preventive/components/visit-location/VisitDistanceLabel";
import type { ActionClient } from "@/contexts/action/action-context";

const client: ActionClient = {
  id: "c-1",
  installmentNumber: 2,
  name: "Maria Silva",
  contract: "12345",
  parcela: "Parcela 2",
  value: "R$ 500,00",
  currentStep: "Contato",
  daysInfo: "10 dias em atraso",
};

describe("RegisterClientCard", () => {
  it("renders client identity and formats contract label", () => {
    render(<RegisterClientCard client={client} />);

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("MS")).toBeInTheDocument();
    expect(
      screen.getByText("Contrato #12345 · 10 dias em atraso"),
    ).toBeInTheDocument();
    expect(screen.getByText("R$ 500,00")).toBeInTheDocument();
  });

  it("keeps contract labels that already include Contrato", () => {
    render(
      <RegisterClientCard client={{ ...client, contract: "Contrato #99" }} />,
    );
    expect(
      screen.getByText("Contrato #99 · 10 dias em atraso"),
    ).toBeInTheDocument();
  });
});

describe("OutcomeOptionList", () => {
  it("selects an option and shows optional note", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onNoteChange = vi.fn();

    render(
      <OutcomeOptionList
        prompt="Como foi o contato?"
        value={null}
        onChange={onChange}
        options={[
          {
            value: "payment_promise",
            label: "Promessa de pagamento",
            desc: "Confirmou que irá pagar",
            color: "teal",
          },
          {
            value: "other",
            label: "Outro",
            desc: "Descreva nas observações",
            color: "gray",
          },
        ]}
        note={{
          value: "",
          onChange: onNoteChange,
          placeholder: "Observação",
        }}
      />,
    );

    expect(screen.getByText("Como foi o contato?")).toBeInTheDocument();
    await user.click(screen.getByText("Promessa de pagamento"));
    expect(onChange).toHaveBeenCalledWith("payment_promise");
    expect(screen.getByPlaceholderText("Observação")).toBeInTheDocument();
  });
});

describe("VisitDistanceLabel", () => {
  it("returns null without distance data", () => {
    const { container } = render(<VisitDistanceLabel variant="confirmed" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders confirmed and not_found variants", () => {
    const { rerender } = render(
      <VisitDistanceLabel
        variant="confirmed"
        distanceMeters={12}
        radiusMeters={100}
      />,
    );
    expect(
      screen.getByText("Distância: 12m (raio de 100m)"),
    ).toBeInTheDocument();

    rerender(
      <VisitDistanceLabel
        variant="not_found"
        distanceMeters={250}
        radiusMeters={100}
      />,
    );
    expect(
      screen.getByText(/Distância: 250m \(raio permitido: 100m\)/),
    ).toBeInTheDocument();
  });
});

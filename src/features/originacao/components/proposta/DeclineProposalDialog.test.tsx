import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeclineProposalDialog } from "@/features/originacao/components/proposta/DeclineProposalDialog";

function renderDialog(
  props: Partial<React.ComponentProps<typeof DeclineProposalDialog>> = {},
) {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <DeclineProposalDialog
      open
      onOpenChange={onOpenChange}
      clientName="Maria Silva"
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { onConfirm, onOpenChange };
}

describe("DeclineProposalDialog", () => {
  it("mostra o cliente e as cinco opções de motivo", () => {
    renderDialog();

    expect(
      screen.getByRole("dialog", { name: "Recusar proposta" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/proposta de Maria Silva/)).toBeInTheDocument();
    for (const label of [
      "Cliente desistiu",
      "Não consegui contato com o cliente",
      "Cliente fora do perfil",
      "Proposta duplicada",
      "Outro motivo",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("exige o motivo antes de recusar", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    expect(
      await screen.findByText("Selecione o motivo da recusa."),
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("recusa com o motivo escolhido e sem observação", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(
      screen.getByRole("button", {
        name: "Não consegui contato com o cliente",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ reason: "no_contact" }),
    );
  });

  it("envia a observação aparada quando preenchida", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Cliente desistiu" }));
    await user.type(
      screen.getByRole("textbox"),
      "  Falou com o gerente hoje  ",
    );
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        reason: "client_gave_up",
        note: "Falou com o gerente hoje",
      }),
    );
  });

  it("exige a descrição quando o motivo é 'Outro motivo'", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Outro motivo" }));
    expect(screen.getByText("Descreva o motivo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    expect(
      await screen.findByText("Descreva o motivo da recusa."),
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox"), "Mudou de cidade");
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        reason: "other",
        note: "Mudou de cidade",
      }),
    );
  });

  it("limita a observação a 500 caracteres", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Cliente desistiu" }));
    await user.click(screen.getByRole("textbox"));
    await user.paste("x".repeat(520));

    expect(screen.getByText("500/500")).toBeInTheDocument();
  });

  it("não fecha enquanto a recusa está em andamento", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog({ pending: true });

    expect(
      screen.getByRole("button", { name: /Recusar proposta/ }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("depois de uma recusa bem-sucedida, o diálogo reaberto para outra proposta vem vazio", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const props = { onOpenChange: vi.fn(), onConfirm };
    const { rerender } = render(
      <DeclineProposalDialog open clientName="Maria Silva" {...props} />,
    );

    await user.click(screen.getByRole("button", { name: "Cliente desistiu" }));
    await user.type(screen.getByRole("textbox"), "Falou com o gerente hoje");
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));

    // Quem fecha é o pai (a lista), depois do sucesso: o diálogo não passa
    // pelo próprio onOpenChange.
    rerender(
      <DeclineProposalDialog
        open={false}
        clientName="Maria Silva"
        {...props}
      />,
    );
    rerender(<DeclineProposalDialog open clientName="João Souza" {...props} />);

    expect(screen.getByText(/proposta de João Souza/)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));
    expect(
      await screen.findByText("Selecione o motivo da recusa."),
    ).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("fechado pelo pai sem recusar (por exemplo, ao trocar de proposta), também reabre vazio", async () => {
    const user = userEvent.setup();
    const props = { onOpenChange: vi.fn(), onConfirm: vi.fn() };
    const { rerender } = render(
      <DeclineProposalDialog open clientName="Maria Silva" {...props} />,
    );

    await user.click(screen.getByRole("button", { name: "Outro motivo" }));
    await user.type(screen.getByRole("textbox"), "Mudou de cidade");
    rerender(
      <DeclineProposalDialog
        open={false}
        clientName="Maria Silva"
        {...props}
      />,
    );
    rerender(<DeclineProposalDialog open clientName="João Souza" {...props} />);

    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByText("Observação (opcional)")).toBeInTheDocument();
  });

  it("cancelar fecha o diálogo", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

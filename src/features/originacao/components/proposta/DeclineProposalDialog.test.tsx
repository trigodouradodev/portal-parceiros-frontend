import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeclineProposalDialog } from "@/features/originacao/components/proposta/DeclineProposalDialog";
import {
  DECLINE_REASON_GROUPS,
  DECLINE_REASON_OPTIONS,
} from "@/features/originacao/data/decline-reasons";
import { QuoteDeclineReason } from "@/services/quotes/quotes.enums";

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

describe("lista de motivos", () => {
  it("tem os 23 motivos, sem código repetido, e todos têm explicação", () => {
    expect(DECLINE_REASON_OPTIONS).toHaveLength(23);
    expect(new Set(DECLINE_REASON_OPTIONS.map((o) => o.value)).size).toBe(23);
    expect(new Set(DECLINE_REASON_OPTIONS.map((o) => o.label)).size).toBe(23);
    for (const option of DECLINE_REASON_OPTIONS) {
      expect(option.description.length).toBeGreaterThan(10);
    }
    expect(DECLINE_REASON_OPTIONS.map((o) => o.value).sort()).toEqual(
      Object.values(QuoteDeclineReason).sort(),
    );
  });

  it("só 'outro' e 'critérios do produto' exigem observação", () => {
    expect(
      DECLINE_REASON_OPTIONS.filter((o) => o.noteRequired)
        .map((o) => o.value)
        .sort(),
    ).toEqual(["other", "product_criteria_not_met"]);
  });
});

describe("DeclineProposalDialog", () => {
  it("mostra o cliente e todos os motivos, agrupados e com explicação", () => {
    renderDialog();

    expect(
      screen.getByRole("dialog", { name: "Recusar proposta" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/proposta de Maria Silva/)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(23);
    for (const group of DECLINE_REASON_GROUPS) {
      const region = screen.getByRole("group", { name: group.title });
      for (const option of group.options) {
        expect(
          within(region).getByRole("radio", { name: option.label }),
        ).toHaveAccessibleDescription(option.description);
      }
    }
  });

  it("marca só o motivo escolhido", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("radio", { name: "Contato inválido" }));
    await user.click(
      screen.getByRole("radio", { name: "Adiou a contratação" }),
    );

    expect(
      screen.getByRole("radio", { name: "Adiou a contratação" }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Contato inválido" }),
    ).not.toBeChecked();
    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
  });

  describe("teclado (padrão dos rádios)", () => {
    const first = DECLINE_REASON_OPTIONS[0];
    const second = DECLINE_REASON_OPTIONS[1];
    const last = DECLINE_REASON_OPTIONS[DECLINE_REASON_OPTIONS.length - 1];

    it("só uma opção entra na ordem do Tab: a primeira, sem seleção", () => {
      renderDialog();

      const radios = screen.getAllByRole("radio");
      expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
      expect(radios[0]).toHaveAttribute("tabindex", "0");
    });

    it("com seleção, a opção selecionada é a que entra no Tab", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole("radio", { name: second.label }));

      const stops = screen
        .getAllByRole("radio")
        .filter((r) => r.tabIndex === 0);
      expect(stops).toHaveLength(1);
      expect(stops[0]).toBe(screen.getByRole("radio", { name: second.label }));
    });

    it("seta para baixo e para cima movem o foco e a seleção", async () => {
      const user = userEvent.setup();
      renderDialog();

      screen.getByRole("radio", { name: first.label }).focus();
      await user.keyboard("{ArrowDown}");

      const next = screen.getByRole("radio", { name: second.label });
      expect(next).toHaveFocus();
      expect(next).toBeChecked();
      expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);

      await user.keyboard("{ArrowUp}");
      const previous = screen.getByRole("radio", { name: first.label });
      expect(previous).toHaveFocus();
      expect(previous).toBeChecked();
    });

    it("as setas dão a volta nas pontas, e Home/End vão ao primeiro/último", async () => {
      const user = userEvent.setup();
      renderDialog();

      screen.getByRole("radio", { name: first.label }).focus();
      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("radio", { name: last.label })).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: first.label })).toHaveFocus();

      await user.keyboard("{End}");
      expect(screen.getByRole("radio", { name: last.label })).toBeChecked();
      await user.keyboard("{Home}");
      expect(screen.getByRole("radio", { name: first.label })).toBeChecked();
    });

    it("as setas andam só entre as opções que a busca deixou visíveis", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.type(screen.getByRole("searchbox"), "contato");
      const visible = screen.getAllByRole("radio");
      expect(visible.length).toBeGreaterThan(1);
      expect(visible.length).toBeLessThan(23);

      visible[0].focus();
      await user.keyboard("{ArrowUp}");
      expect(visible[visible.length - 1]).toHaveFocus();
      expect(visible[visible.length - 1]).toBeChecked();
    });

    it("a escolha feita pelas setas é a enviada", async () => {
      const user = userEvent.setup();
      const { onConfirm } = renderDialog();

      screen.getByRole("radio", { name: first.label }).focus();
      await user.keyboard("{ArrowDown}");
      await user.click(
        screen.getByRole("button", { name: "Recusar proposta" }),
      );

      await waitFor(() =>
        expect(onConfirm).toHaveBeenCalledWith({ reason: second.value }),
      );
    });
  });

  it("busca por nome ou explicação, sem diferenciar acento, e esconde grupos vazios", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(
      screen.getByRole("searchbox", { name: "Buscar motivo" }),
      "regiao",
    );
    expect(screen.getAllByRole("radio")).toHaveLength(1);
    expect(
      screen.getByRole("radio", { name: "Fora da região atendida" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Condições da oferta" }),
    ).not.toBeInTheDocument();

    // Pela explicação, não só pelo nome.
    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "caixa do cliente");
    expect(
      screen.getByRole("radio", { name: "Parcela acima do orçamento" }),
    ).toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "xyz inexistente");
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getByText("Nenhum motivo encontrado.")).toBeInTheDocument();
  });

  it("a escolha continua marcada mesmo quando a busca a esconde, e é enviada", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(
      screen.getByRole("radio", { name: "Taxa de juros não aceita" }),
    );
    await user.type(screen.getByRole("searchbox"), "visita");
    expect(
      screen.queryByRole("radio", { name: "Taxa de juros não aceita" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        reason: "interest_rate_not_accepted",
      }),
    );
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
      screen.getByRole("radio", { name: "Cliente não responde" }),
    );
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ reason: "no_response" }),
    );
  });

  it("envia a observação aparada quando preenchida", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(
      screen.getByRole("radio", { name: "Desistiu sem informar o motivo" }),
    );
    expect(screen.getByText("Observação (opcional)")).toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox"),
      "  Falou com o gerente hoje  ",
    );
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        reason: "gave_up_no_reason",
        note: "Falou com o gerente hoje",
      }),
    );
  });

  it("exige a descrição quando o motivo é 'Outro motivo'", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("radio", { name: "Outro motivo" }));
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

  it("exige o critério quando o motivo é 'Não atende aos critérios do produto'", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(
      screen.getByRole("radio", {
        name: "Não atende aos critérios do produto",
      }),
    );
    expect(screen.getByText("Qual critério?")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      expect.stringContaining("faturamento"),
    );
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    expect(
      await screen.findByText("Informe o critério que o cliente não atende."),
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.type(
      screen.getByRole("textbox"),
      "Faturamento abaixo do mínimo",
    );
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        reason: "product_criteria_not_met",
        note: "Faturamento abaixo do mínimo",
      }),
    );
  });

  it("trocar de um motivo que exige observação para outro que não exige tira a exigência", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("radio", { name: "Outro motivo" }));
    await user.click(screen.getByRole("radio", { name: "Contato inválido" }));
    expect(screen.getByText("Observação (opcional)")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ reason: "invalid_contact" }),
    );
  });

  it("limita a observação a 500 caracteres", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(
      screen.getByRole("radio", { name: "Cliente não responde" }),
    );
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

    await user.click(
      screen.getByRole("radio", { name: "Cliente não responde" }),
    );
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
    expect(screen.queryAllByRole("radio", { checked: true })).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));
    expect(
      await screen.findByText("Selecione o motivo da recusa."),
    ).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("fechado pelo pai sem recusar (por exemplo, ao trocar de proposta), também reabre vazio, inclusive a busca", async () => {
    const user = userEvent.setup();
    const props = { onOpenChange: vi.fn(), onConfirm: vi.fn() };
    const { rerender } = render(
      <DeclineProposalDialog open clientName="Maria Silva" {...props} />,
    );

    await user.type(screen.getByRole("searchbox"), "outro");
    await user.click(screen.getByRole("radio", { name: "Outro motivo" }));
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
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getAllByRole("radio")).toHaveLength(23);
    expect(screen.getByText("Observação (opcional)")).toBeInTheDocument();
  });

  it("cancelar fecha o diálogo", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

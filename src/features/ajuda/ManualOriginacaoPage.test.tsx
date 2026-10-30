import { render, screen } from "@testing-library/react";
import { ManualOriginacaoPage } from "@/features/ajuda/ManualOriginacaoPage";
import { ORIGINACAO_MANUAL_URL } from "@/features/ajuda";

describe("ManualOriginacaoPage", () => {
  it("renderiza o manual com título, navegação por seções e volta ao Portal", () => {
    render(<ManualOriginacaoPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Manual de Originação" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "← Voltar ao Portal" }),
    ).toHaveAttribute("href", "/originacao");
    expect(screen.getByRole("link", { name: "2 · Simular" })).toHaveAttribute(
      "href",
      "#simulacao",
    );
    expect(document.getElementById("duvidas")).not.toBeNull();
  });

  it("ensina o seguro prestamista com o texto de teste e o exemplo atual", () => {
    const { container } = render(<ManualOriginacaoPage />);
    const text = (container.textContent ?? "").replace(/\s+/g, " ");

    expect(text).toContain(
      "O seguro prestamista custa 3% do valor solicitado e é financiado junto com o crédito, com os mesmos juros",
    );
    expect(text).toContain("R$ 670,65");
    expect(text).toContain("R$ 690,77");
  });

  it("ajusta o título da aba e restaura ao sair", () => {
    document.title = "Portal";
    const { unmount } = render(<ManualOriginacaoPage />);
    expect(document.title).toBe("Manual de Originação · Portal do Parceiro");

    unmount();
    expect(document.title).toBe("Portal");
  });

  it("a URL do manual é a rota registrada", () => {
    expect(ORIGINACAO_MANUAL_URL).toBe("/ajuda/originacao");
  });
});

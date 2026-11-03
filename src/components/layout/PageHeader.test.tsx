import { screen } from "@testing-library/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { renderWithProviders } from "@/test/render";

describe("PageHeader", () => {
  it("mostra a marca (logo Aurea / Portal Parceiro) — some no mobile onde a AppSidebar fica escondida", () => {
    const { container } = renderWithProviders(<PageHeader />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("Portal Parceiro")).toBeInTheDocument();
  });

  it("usa o avatar de sair compartilhado no header amarelo", () => {
    const onLogout = vi.fn();
    renderWithProviders(<PageHeader onLogout={onLogout} />);

    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("o ícone de ajuda abre o manual Primeiros Passos por padrão", () => {
    renderWithProviders(<PageHeader />);

    const help = screen.getByRole("link", {
      name: "Ajuda: primeiros passos no Portal",
    });
    expect(help).toHaveAttribute("href", "/ajuda/primeiros-passos");
    expect(help).toHaveAttribute("target", "_blank");
  });

  it("o ícone de ajuda aponta para o destino informado (manual de originação)", () => {
    renderWithProviders(
      <PageHeader
        helpHref="/ajuda/originacao"
        helpLabel="Ajuda: manual de originação"
      />,
    );

    const help = screen.getByRole("link", {
      name: "Ajuda: manual de originação",
    });
    expect(help).toHaveAttribute("href", "/ajuda/originacao");
    expect(help).toHaveAttribute("target", "_blank");
  });
});

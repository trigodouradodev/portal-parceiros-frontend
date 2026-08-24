import { screen } from "@testing-library/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { renderWithProviders } from "@/test/render";

describe("PageHeader", () => {
  it("mostra a marca (logo Aurea / Portal Parceiro) — some no mobile onde a AppSidebar fica escondida", () => {
    const { container } = renderWithProviders(<PageHeader />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("Portal Parceiro")).toBeInTheDocument();
  });
});

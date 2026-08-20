import { screen } from "@testing-library/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { renderWithProviders } from "@/test/render";

describe("PageHeader", () => {
  it("mostra a marca (aurea / Portal Parceiro) — some no mobile onde a AppSidebar fica escondida", () => {
    renderWithProviders(<PageHeader />);

    expect(screen.getByText("aurea")).toBeInTheDocument();
    expect(screen.getByText("Portal Parceiro")).toBeInTheDocument();
  });
});

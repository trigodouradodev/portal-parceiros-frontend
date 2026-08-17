import { render, screen } from "@testing-library/react";
import { BreakdownRow } from "@/features/performance/components/BreakdownRow";

describe("BreakdownRow", () => {
  it("renders name, value and optional tag", () => {
    render(
      <BreakdownRow
        name="Bônus desembolso"
        value={200}
        tag="Ativo"
        sub="+10%"
      />,
    );

    expect(screen.getByText("Bônus desembolso")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("+10%")).toBeInTheDocument();
    expect(screen.getByText(/\+R\$\s*200,00/)).toBeInTheDocument();
  });

  it("hides plus prefix when dimmed", () => {
    render(<BreakdownRow name="Item" value={100} dim />);

    expect(screen.getByText(/R\$\s*100,00/)).toBeInTheDocument();
    expect(screen.queryByText(/\+R\$/)).not.toBeInTheDocument();
  });
});

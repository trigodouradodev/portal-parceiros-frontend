import { render, screen } from "@testing-library/react";
import { CommissionPill } from "@/features/performance/components/CommissionPill";

describe("CommissionPill", () => {
  it("renders children with default tone", () => {
    render(<CommissionPill>Fixo R$ 2.000,00</CommissionPill>);

    const pill = screen.getByText("Fixo R$ 2.000,00");
    expect(pill).toBeInTheDocument();
    expect(pill.className).toContain("bg-white/15");
  });

  it("applies green tone classes", () => {
    render(<CommissionPill tone="green">Desembolso +R$ 200,00</CommissionPill>);

    expect(screen.getByText("Desembolso +R$ 200,00").className).toContain(
      "bg-[#E6F7F1]",
    );
  });
});

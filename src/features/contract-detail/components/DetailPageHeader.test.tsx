import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { DetailPageHeader } from "@/features/contract-detail/components/DetailPageHeader";
import type { ContractDetailView } from "@/features/contract-detail/types";

const DETAIL: ContractDetailView = {
  contractId: "contract-1",
  businessName: "Cliente Teste",
  clientName: "Cliente Teste",
  contractCode: "12345",
  statusLabel: "Vence hoje",
  statusColor: "red",
  installmentValue: 100,
  installmentTotalAmount: 100,
  installmentNumber: 1,
  totalInstallments: 6,
  contractTotalAmount: 600,
  nextDue: "05/08/2026",
  timeline: [],
};

describe("DetailPageHeader", () => {
  it("mostra a marca (logo Aurea / Portal Parceiro) — some no mobile onde a AppSidebar fica escondida", () => {
    const { container } = render(
      <DetailPageHeader detail={DETAIL} onBack={vi.fn()} />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("Portal Parceiro")).toBeInTheDocument();
  });
});

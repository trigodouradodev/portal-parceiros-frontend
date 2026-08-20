import type { UseQueryResult } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { ContractInstallmentsSection } from "@/features/contract-detail/components/ContractInstallmentsSection";
import { useContractInstallments } from "@/hooks/useContractInstallments";
import { renderWithProviders } from "@/test/render";
import type { ContractInstallmentsList } from "@/services/contracts/contracts.types";

vi.mock("@/hooks/useContractInstallments", async () => {
  const actual = await vi.importActual<
    typeof import("@/hooks/useContractInstallments")
  >("@/hooks/useContractInstallments");
  return { ...actual, useContractInstallments: vi.fn() };
});

const mockedUseContractInstallments = vi.mocked(useContractInstallments);

function successQuery(
  data: ContractInstallmentsList,
): UseQueryResult<ContractInstallmentsList, Error> {
  return {
    isLoading: false,
    isError: false,
    data,
  } as UseQueryResult<ContractInstallmentsList, Error>;
}

describe("ContractInstallmentsSection", () => {
  it("mostra dias em atraso e contagem de follow-ups só na parcela atrasada", () => {
    mockedUseContractInstallments.mockReturnValue(
      successQuery({
        items: [
          {
            number: 1,
            dueDate: "2026-07-10",
            totalAmount: 500,
            pendingAmount: 500,
            displayStatus: "overdue",
            daysOverdue: 9,
            followUpsCount: 3,
          },
          {
            number: 2,
            dueDate: "2026-09-10",
            totalAmount: 500,
            pendingAmount: 500,
            displayStatus: "upcoming",
          },
        ],
      }),
    );

    renderWithProviders(
      <ContractInstallmentsSection contractId="contract-1" />,
      { withRouter: true },
    );

    expect(screen.getByText("9d atraso")).toBeInTheDocument();
    expect(screen.getByText("3 follow-ups")).toBeInTheDocument();
    expect(screen.queryByText("Sem follow-up")).not.toBeInTheDocument();
  });

  it("mostra 'Sem follow-up' quando a parcela atrasada não teve nenhum registro", () => {
    mockedUseContractInstallments.mockReturnValue(
      successQuery({
        items: [
          {
            number: 1,
            dueDate: "2026-07-10",
            totalAmount: 500,
            pendingAmount: 500,
            displayStatus: "overdue",
            daysOverdue: 2,
            followUpsCount: 0,
          },
        ],
      }),
    );

    renderWithProviders(
      <ContractInstallmentsSection contractId="contract-1" />,
      { withRouter: true },
    );

    expect(screen.getByText("Sem follow-up")).toBeInTheDocument();
  });
});

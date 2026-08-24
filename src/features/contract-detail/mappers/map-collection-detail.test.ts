import { mapPortfolioContractDetailToView } from "@/features/contract-detail/mappers/map-collection-detail";
import type { CollectionDetail } from "@/services/dashboard/dashboard.types";

function detailWithDueDate(dueDate: string): CollectionDetail {
  return {
    contract: {
      id: "contract-1",
      number: "12345",
      status: "disbursed",
      totalInstallments: 6,
      totalAmount: 20000,
      startDate: "2026-02-05",
      endDate: "2026-08-05",
    },
    client: { name: "Cliente Teste", taxId: "00000000000" },
    installment: {
      id: "installment-1",
      number: 6,
      label: "Parcela 6",
      dueDate,
      totalAmount: 4485.4,
      pendingAmount: 4485.4,
      status: "not_paid",
    },
    followups: [],
    statusHistory: [],
  };
}

describe("mapPortfolioDetail — badge de vencimento/atraso (bug fix)", () => {
  // Horário local ao meio-dia (sem "Z") pros dois lados — "hoje" e o
  // vencimento — pra evitar que o fuso horário local desloque a data.
  const DUE_DATE = "2026-08-05T12:00:00";

  it("usa alertType overdue com os dias reais quando a parcela já venceu", () => {
    vi.setSystemTime(new Date("2026-08-19T12:00:00"));

    const view = mapPortfolioContractDetailToView(detailWithDueDate(DUE_DATE));

    expect(view.alertType).toBe("overdue");
    expect(view.alertDays).toBe(14);
    expect(view.statusLabel).toBe("14d em atraso");

    vi.useRealTimers();
  });

  it('mantém "Vence hoje" (alertType renewal, days 0) quando vence hoje', () => {
    vi.setSystemTime(new Date("2026-08-05T18:00:00"));

    const view = mapPortfolioContractDetailToView(detailWithDueDate(DUE_DATE));

    expect(view.alertType).toBe("renewal");
    expect(view.alertDays).toBe(0);
    expect(view.statusLabel).toBe("Vence hoje");

    vi.useRealTimers();
  });

  it("mantém alertType renewal com dias até o vencimento quando ainda não venceu", () => {
    vi.setSystemTime(new Date("2026-08-01T12:00:00"));

    const view = mapPortfolioContractDetailToView(detailWithDueDate(DUE_DATE));

    expect(view.alertType).toBe("renewal");
    expect(view.alertDays).toBe(4);
    expect(view.statusLabel).toBe("Vence em 4d");

    vi.useRealTimers();
  });
});

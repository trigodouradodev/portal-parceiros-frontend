import { describe, expect, it } from "vitest";
import { installmentSubtitle } from "./installment-subtitle";
import type { ContractInstallmentItem } from "@/services/contracts/contracts.types";

function item(
  overrides: Partial<ContractInstallmentItem> = {},
): ContractInstallmentItem {
  return {
    number: 1,
    dueDate: "2026-08-10",
    totalAmount: 200,
    pendingAmount: 200,
    displayStatus: "upcoming",
    ...overrides,
  };
}

describe("installmentSubtitle", () => {
  it("mostra a data de pagamento quando a parcela está paga", () => {
    expect(
      installmentSubtitle(
        item({ displayStatus: "paid", paymentDate: "2026-08-05" }),
      ),
    ).toBe("Paga em 05/08/2026");
  });

  it("cai pra 'Paga' quando está paga mas sem data de pagamento", () => {
    expect(installmentSubtitle(item({ displayStatus: "paid" }))).toBe("Paga");
  });

  it("mostra só o aviso quando vence hoje, sem repetir a data", () => {
    expect(installmentSubtitle(item({ displayStatus: "due_today" }))).toBe(
      "Vence hoje",
    );
  });

  it("mostra 'Venceu' com a data quando está atrasada", () => {
    expect(
      installmentSubtitle(
        item({ displayStatus: "overdue", dueDate: "2026-08-01" }),
      ),
    ).toBe("Venceu 01/08/2026");
  });

  it("mostra 'Vence' com a data quando está a vencer", () => {
    expect(
      installmentSubtitle(
        item({ displayStatus: "upcoming", dueDate: "2026-09-10" }),
      ),
    ).toBe("Vence 10/09/2026");
  });
});

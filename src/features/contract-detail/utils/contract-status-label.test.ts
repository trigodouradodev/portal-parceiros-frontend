import { describe, expect, it } from "vitest";
import { contractStatusLabel } from "./contract-status-label";

describe("contractStatusLabel", () => {
  it("traduz os status conhecidos", () => {
    expect(contractStatusLabel("pending")).toBe("Pendente");
    expect(contractStatusLabel("disbursed")).toBe("Desembolsado");
    expect(contractStatusLabel("cancelled")).toBe("Cancelado");
  });

  it("cai pro valor bruto quando o status não é mapeado", () => {
    expect(contractStatusLabel("algo_novo_do_webhook")).toBe(
      "algo_novo_do_webhook",
    );
  });
});

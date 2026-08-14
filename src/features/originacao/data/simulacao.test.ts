import { describe, expect, it } from "vitest";
import {
  DIAS_VENCIMENTO_PERMITIDOS,
  ehDiaVencimentoPermitido,
  PARCELAS_OPCOES,
  TAXA_PRODUTO,
} from "@/features/originacao/data/simulacao";

describe("ehDiaVencimentoPermitido", () => {
  it.each(DIAS_VENCIMENTO_PERMITIDOS)("allows day %s of the month", (day) => {
    expect(ehDiaVencimentoPermitido(new Date(2026, 7, day))).toBe(true);
  });

  it("rejects other days", () => {
    expect(ehDiaVencimentoPermitido(new Date(2026, 7, 1))).toBe(false);
    expect(ehDiaVencimentoPermitido(new Date(2026, 7, 13))).toBe(false);
    expect(ehDiaVencimentoPermitido(new Date(2026, 7, 31))).toBe(false);
  });
});

describe("simulacao constants", () => {
  it("covers 2x..12x and product rates", () => {
    expect(PARCELAS_OPCOES).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(TAXA_PRODUTO.Pessoal).toBe(3.39);
    expect(TAXA_PRODUTO.Premium).toBe(1.99);
    expect(TAXA_PRODUTO.Giro).toBe(2.89);
  });
});

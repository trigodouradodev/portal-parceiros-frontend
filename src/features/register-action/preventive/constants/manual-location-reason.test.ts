import { describe, expect, it } from "vitest";
import { appendManualLocationAuditNote } from "./manual-location-reason";

describe("appendManualLocationAuditNote", () => {
  it("anexa o motivo da confirmação manual", () => {
    expect(
      appendManualLocationAuditNote("Obs do parceiro", "gps_imprecise", false),
    ).toBe("Obs do parceiro\n[Confirmação manual: GPS impreciso]");
  });

  it("sinaliza geocoding suspeito quando addressLikelyWrong", () => {
    expect(appendManualLocationAuditNote(undefined, "no_signal", true)).toBe(
      "[Confirmação manual: Sem sinal / sinal fraco] [Sinal: endereço possivelmente mal geocodificado]",
    );
  });

  it("sinaliza geocoding suspeito quando o motivo é endereço errado", () => {
    expect(appendManualLocationAuditNote("", "wrong_address", false)).toContain(
      "[Sinal: endereço possivelmente mal geocodificado]",
    );
  });
});

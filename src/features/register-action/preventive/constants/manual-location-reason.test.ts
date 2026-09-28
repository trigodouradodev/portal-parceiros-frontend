import { describe, expect, it } from "vitest";
import {
  appendManualLocationAuditNote,
  manualLocationReasonOptions,
  manualLocationReasonRequiresNote,
} from "./manual-location-reason";

describe("appendManualLocationAuditNote", () => {
  it("anexa o motivo da confirmação manual", () => {
    expect(
      appendManualLocationAuditNote(
        "Obs do parceiro",
        "device_unavailable",
        false,
      ),
    ).toBe(
      "Obs do parceiro\n[Confirmação manual: Meu celular não conseguiu me localizar]",
    );
  });

  it("sinaliza geocoding suspeito quando addressLikelyWrong", () => {
    expect(
      appendManualLocationAuditNote(undefined, "device_unavailable", true),
    ).toBe(
      "[Confirmação manual: Meu celular não conseguiu me localizar] [Sinal: endereço possivelmente mal geocodificado]",
    );
  });

  it("sinaliza geocoding suspeito quando o motivo aponta para o endereço", () => {
    expect(
      appendManualLocationAuditNote("", "registered_address_wrong", false),
    ).toContain("[Sinal: endereço possivelmente mal geocodificado]");
    expect(
      appendManualLocationAuditNote("", "at_address_pin_wrong", false),
    ).toContain("[Sinal: endereço possivelmente mal geocodificado]");
  });

  it("inclui o texto livre do outro motivo", () => {
    expect(
      appendManualLocationAuditNote(
        "Obs",
        "other",
        false,
        "  encontrei na praça  ",
      ),
    ).toBe("Obs\n[Confirmação manual: Outro motivo — encontrei na praça]");
  });
});

describe("manualLocationReasonOptions", () => {
  it("oferece o pin aproximado quando o geocoding não é confiável", () => {
    const values = manualLocationReasonOptions("approximate_address").map(
      (option) => option.value,
    );

    expect(values).toContain("at_address_pin_wrong");
    expect(values).not.toContain("device_unavailable");
  });

  it("não pergunta do aparelho quando o problema é permissão", () => {
    const values = manualLocationReasonOptions("permission_blocked").map(
      (option) => option.value,
    );

    expect(values).toContain("permission_unavailable");
    expect(values).not.toContain("device_unavailable");
  });

  it("sempre deixa uma saída livre", () => {
    const contexts = [
      "approximate_address",
      "device_failure",
      "permission_blocked",
      "out_of_radius",
    ] as const;

    for (const context of contexts) {
      const values = manualLocationReasonOptions(context).map(
        (option) => option.value,
      );
      expect(values).toContain("other");
    }
  });
});

describe("manualLocationReasonRequiresNote", () => {
  it("só exige texto livre no outro motivo", () => {
    expect(manualLocationReasonRequiresNote("other")).toBe(true);
    expect(manualLocationReasonRequiresNote("client_came_to_me")).toBe(false);
  });
});

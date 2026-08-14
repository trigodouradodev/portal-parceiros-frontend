import { describe, expect, it } from "vitest";
import {
  buildContractListPath,
  parseContractListSearchParams,
} from "./contract-list-route";

describe("buildContractListPath", () => {
  it("encodes the title and omits unset filters", () => {
    expect(buildContractListPath("Carteira Ativa (DC)")).toBe(
      "/carteira/contratos?title=Carteira+Ativa+%28DC%29",
    );
  });

  it("includes only the active filter flags", () => {
    const path = buildContractListPath("Contratos em Inadimplência", {
      onlyDelinquency: true,
    });
    expect(path).toContain("onlyDelinquency=true");
    expect(path).not.toContain("onlyActive");
    expect(path).not.toContain("onlyRenegotiated");
  });
});

describe("parseContractListSearchParams", () => {
  it("round-trips through buildContractListPath", () => {
    const path = buildContractListPath("Contratos Renegociados", {
      onlyRenegotiated: true,
    });
    const [, query] = path.split("?");
    const { title, initialFilter } = parseContractListSearchParams(
      new URLSearchParams(query),
    );
    expect(title).toBe("Contratos Renegociados");
    expect(initialFilter).toEqual({
      onlyActive: false,
      onlyDelinquency: false,
      onlyRenegotiated: true,
    });
  });

  it("falls back to a default title when missing", () => {
    const { title } = parseContractListSearchParams(new URLSearchParams(""));
    expect(title).toBe("Contratos");
  });
});

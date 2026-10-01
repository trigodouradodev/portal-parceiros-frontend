import { describe, expect, it } from "vitest";
import {
  buildSimulationsListQuery,
  isSimulationsFilterActive,
} from "@/features/originacao/data/simulations-list-query";

describe("buildSimulationsListQuery", () => {
  it("omits empty fields", () => {
    expect(buildSimulationsListQuery("  ")).toEqual({});
  });

  it("treats letters as a name, trimmed", () => {
    expect(buildSimulationsListQuery("  maria  ")).toEqual({
      name: "maria",
    });
  });

  it("treats digits, with or without mask, as CPF", () => {
    expect(buildSimulationsListQuery("529.982.247-25")).toEqual({
      document: "52998224725",
    });
    expect(buildSimulationsListQuery("52998224725")).toEqual({
      document: "52998224725",
    });
    expect(buildSimulationsListQuery("529")).toEqual({
      document: "529",
    });
  });

  it("keeps mixed alphanumeric terms as a name", () => {
    expect(buildSimulationsListQuery("Maria 529")).toEqual({
      name: "Maria 529",
    });
  });
});

describe("isSimulationsFilterActive", () => {
  it("is inactive when both fields are empty", () => {
    expect(isSimulationsFilterActive({})).toBe(false);
  });

  it("is active when either field is set", () => {
    expect(isSimulationsFilterActive({ name: "maria" })).toBe(true);
    expect(isSimulationsFilterActive({ document: "529" })).toBe(true);
  });
});

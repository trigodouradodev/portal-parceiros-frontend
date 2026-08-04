import { AxiosError } from "axios";
import { isNotFoundError } from "@/hooks/usePerformanceData";
import { getApiErrorMessage } from "@/lib/api/errors";

function axiosError(status: number, message?: string | string[]) {
  return new AxiosError("error", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: message === undefined ? {} : { message },
    statusText: "Error",
    headers: {},
    config: { headers: {} as never },
  });
}

describe("isNotFoundError", () => {
  it("detects axios 404", () => {
    expect(isNotFoundError(axiosError(404))).toBe(true);
    expect(isNotFoundError(axiosError(500))).toBe(false);
    expect(isNotFoundError(new Error("nope"))).toBe(false);
  });
});

describe("getApiErrorMessage", () => {
  it("returns fallback for non-axios errors", () => {
    expect(getApiErrorMessage(new Error("x"), "fallback")).toBe("fallback");
  });

  it("reads string and array messages from response", () => {
    expect(getApiErrorMessage(axiosError(400, "Inválido"), "fallback")).toBe(
      "Inválido",
    );
    expect(
      getApiErrorMessage(axiosError(400, ["A", "B"]), "fallback"),
    ).toBe("A, B");
    expect(getApiErrorMessage(axiosError(400), "fallback")).toBe("fallback");
  });
});

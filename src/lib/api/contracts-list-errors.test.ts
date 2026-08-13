import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { getContractsListErrorMessage } from "./contracts-list-errors";

function axiosError(status: number, message?: string | string[]) {
  return new AxiosError("error", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: message === undefined ? {} : { message },
    statusText: "Error",
    headers: {},
    config: { headers: {} as never },
  });
}

describe("getContractsListErrorMessage", () => {
  it("translates known validation codes", () => {
    expect(
      getContractsListErrorMessage(
        axiosError(400, "start_date_must_be_before_end_date"),
        "fallback",
      ),
    ).toBe("A data inicial deve ser anterior à data final.");
  });

  it("keeps unknown messages and fallback", () => {
    expect(
      getContractsListErrorMessage(axiosError(400, "other_code"), "fallback"),
    ).toBe("other_code");
    expect(getContractsListErrorMessage(new Error("x"), "fallback")).toBe(
      "fallback",
    );
  });
});

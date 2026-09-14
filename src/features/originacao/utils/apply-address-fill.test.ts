import { describe, expect, it, vi } from "vitest";
import {
  applyAddressFill,
  clearAddressFill,
} from "@/features/originacao/utils/apply-address-fill";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import type { UseFormSetValue } from "react-hook-form";

describe("clearAddressFill (AUREA-481)", () => {
  it("clears street, neighborhood, city and state but not zipCode", () => {
    const setValue = vi.fn() as unknown as UseFormSetValue<ProposalFormData>;

    clearAddressFill(setValue, "address");

    expect(setValue).toHaveBeenCalledWith("address.street", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenCalledWith("address.neighborhood", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenCalledWith("address.city", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    expect(setValue).toHaveBeenCalledWith("address.state", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    expect(setValue).not.toHaveBeenCalledWith(
      "address.zipCode",
      expect.anything(),
      expect.anything(),
    );
  });
});

describe("applyAddressFill", () => {
  it("fills cep-derived address fields", () => {
    const setValue = vi.fn() as unknown as UseFormSetValue<ProposalFormData>;

    applyAddressFill(setValue, "guarantor", {
      zipCode: "01310-100",
      street: "Av Paulista",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    });

    expect(setValue).toHaveBeenCalledWith(
      "guarantor.zipCode",
      "01310-100",
      expect.any(Object),
    );
    expect(setValue).toHaveBeenCalledWith(
      "guarantor.street",
      "Av Paulista",
      expect.any(Object),
    );
  });
});

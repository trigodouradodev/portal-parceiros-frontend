import { api } from "@/lib/api/axios";
import type { PostalCodeAddress } from "./locations.types";

export const CEP_LOOKUP_TIMEOUT_MS = 5_000;

export const locationsKeys = {
  all: ["locations"] as const,
  postalCode: (digits: string) =>
    [...locationsKeys.all, "postal-code", digits] as const,
};

export const locationsService = {
  /** GET /locations/postal-code/:zipCode */
  async findPostalCode(
    zipCode: string,
    signal?: AbortSignal,
  ): Promise<PostalCodeAddress> {
    const { data } = await api.get<PostalCodeAddress>(
      `/locations/postal-code/${zipCode}`,
      { signal, timeout: CEP_LOOKUP_TIMEOUT_MS },
    );
    return data;
  },
};

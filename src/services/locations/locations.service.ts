import { api } from "@/lib/api/axios";
import type {
  PostalCodeAddress,
  ReverseGeocodedAddress,
} from "./locations.types";

export const CEP_LOOKUP_TIMEOUT_MS = 5_000;
export const REVERSE_GEOCODE_TIMEOUT_MS = 10_000;

export const locationsKeys = {
  all: ["locations"] as const,
  postalCode: (digits: string) =>
    [...locationsKeys.all, "postal-code", digits] as const,
  reverseGeocode: (latitude: number, longitude: number) =>
    [...locationsKeys.all, "reverse-geocode", latitude, longitude] as const,
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

  /** GET /locations/reverse-geocode?latitude=&longitude= */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    signal?: AbortSignal,
  ): Promise<ReverseGeocodedAddress> {
    const { data } = await api.get<ReverseGeocodedAddress>(
      "/locations/reverse-geocode",
      {
        params: { latitude, longitude },
        signal,
        timeout: REVERSE_GEOCODE_TIMEOUT_MS,
      },
    );
    return data;
  },
};

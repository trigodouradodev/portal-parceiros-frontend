import { formatAddressNumber } from "@/features/originacao/utils/format-address-number";
import { formatCep } from "@/features/originacao/utils/format-cep";
import type { ReverseGeocodedAddress } from "@/services/locations/locations.types";

export interface GeoAddressFill {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

/** Converte a resposta do reverse-geocode nos campos do formulário. */
export function mapReverseGeocodeToFill(
  data: ReverseGeocodedAddress,
): GeoAddressFill {
  const fill: GeoAddressFill = {};

  const zipDigits = data.zipCode?.replace(/\D/g, "") ?? "";
  if (zipDigits.length === 8) fill.zipCode = formatCep(zipDigits);

  const street = data.streetName?.trim();
  if (street) fill.street = street;

  const number = data.streetNumber
    ? formatAddressNumber(data.streetNumber)
    : "";
  if (number) fill.number = number;

  const complement = data.streetComplement?.trim();
  if (complement) fill.complement = complement;

  const neighborhood = data.streetDistrict?.trim();
  if (neighborhood) fill.neighborhood = neighborhood;

  const city = data.city?.trim();
  if (city) fill.city = city;

  const state = data.state?.trim().toUpperCase() ?? "";
  if (state) fill.state = state;

  return fill;
}

/** Precisão do GPS no formato esperado pelo PATCH (`15m`). */
export function formatGeoPrecision(accuracyMeters: number): string {
  if (!Number.isFinite(accuracyMeters) || accuracyMeters <= 0) return "unknown";
  return `${Math.round(accuracyMeters)}m`;
}

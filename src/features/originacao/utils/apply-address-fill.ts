import type { UseFormSetValue } from "react-hook-form";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import type { GeoAddressFill } from "@/features/originacao/mappers/map-reverse-geocode-to-fill";
import type { CepLookupResult } from "@/services/cep/cep.types";

export type AddressPrefix = "address" | "guarantor";

type AddressFieldName =
  | "zipCode"
  | "street"
  | "number"
  | "complement"
  | "neighborhood"
  | "city"
  | "state";

const FILL_FIELDS = [
  "zipCode",
  "street",
  "neighborhood",
  "city",
  "state",
] as const satisfies ReadonlyArray<keyof CepLookupResult>;

const GEO_FILL_FIELDS = [
  "zipCode",
  "street",
  "number",
  "complement",
  "neighborhood",
  "city",
  "state",
] as const satisfies ReadonlyArray<keyof GeoAddressFill>;

export function addressPath<F extends AddressFieldName>(
  prefix: AddressPrefix,
  field: F,
): `${AddressPrefix}.${F}` {
  return `${prefix}.${field}`;
}

/** Preenche CEP/rua/bairro/cidade/UF. Número e complemento ficam manuais. */
export function applyAddressFill(
  setValue: UseFormSetValue<ProposalFormData>,
  prefix: AddressPrefix,
  fill: CepLookupResult,
) {
  const options = { shouldDirty: true, shouldValidate: true };
  for (const field of FILL_FIELDS) {
    setValue(addressPath(prefix, field), fill[field], options);
  }
}

/** Preenche os campos presentes no reverse-geocode (inclui número/complemento). */
export function applyGeoAddressFill(
  setValue: UseFormSetValue<ProposalFormData>,
  prefix: AddressPrefix,
  fill: GeoAddressFill,
) {
  const options = { shouldDirty: true, shouldValidate: true };
  for (const field of GEO_FILL_FIELDS) {
    const value = fill[field];
    if (value) setValue(addressPath(prefix, field), value, options);
  }
}

import type { UseFormSetValue } from "react-hook-form";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
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

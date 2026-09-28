import { useEffect } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";
import {
  mapPartyToIdentityFill,
  type PartyIdentityFill,
} from "@/features/originacao/mappers/map-party-to-guarantor";
import type { SimulationFormValues } from "@/features/originacao/schemas/simulation-form";
import { isValidCpf } from "@/lib/validation/cpf";

export function useSimulationPartyAutoFill(
  getValues: UseFormGetValues<SimulationFormValues>,
  setValue: UseFormSetValue<SimulationFormValues>,
  options?: { lookupOnMountCpf?: string },
) {
  const { status, onCpfComplete, onCpfIncomplete } = usePartyLookup<
    keyof PartyIdentityFill
  >({
    mapParty: mapPartyToIdentityFill,
    read: (field) => getValues(field),
    write: (field, value) =>
      setValue(field, value, { shouldDirty: true, shouldValidate: true }),
    clear: (field) => setValue(field, "", { shouldDirty: true }),
  });

  const mountCpf = options?.lookupOnMountCpf;
  useEffect(() => {
    const digits = (mountCpf ?? "").replace(/\D/g, "");
    if (isValidCpf(digits)) onCpfComplete(digits);
  }, [mountCpf, onCpfComplete]);

  return { status, onCpfComplete, onCpfIncomplete };
}

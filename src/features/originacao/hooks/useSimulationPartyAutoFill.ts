import { useEffect, useRef } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";
import {
  PARTY_IDENTITY_FIELDS,
  mapPartyToIdentityFill,
  type PartyIdentityFill,
} from "@/features/originacao/mappers/map-party-to-guarantor";
import type { SimulationFormValues } from "@/features/originacao/schemas/simulation-form";

export function useSimulationPartyAutoFill(
  getValues: UseFormGetValues<SimulationFormValues>,
  setValue: UseFormSetValue<SimulationFormValues>,
  initialCpf?: string,
) {
  const { party, status, onCpfChange } = usePartyLookup(initialCpf);
  const filledRef = useRef<PartyIdentityFill>({});

  useEffect(() => {
    const previous = filledRef.current;
    const next = party ? mapPartyToIdentityFill(party) : {};
    for (const field of PARTY_IDENTITY_FIELDS) {
      const value = next[field];
      if (value) {
        setValue(field, value, { shouldDirty: true, shouldValidate: true });
      } else if (previous[field] && getValues(field) === previous[field]) {
        setValue(field, "", { shouldDirty: true });
      }
    }
    filledRef.current = next;
  }, [party, getValues, setValue]);

  return { status, onCpfChange };
}

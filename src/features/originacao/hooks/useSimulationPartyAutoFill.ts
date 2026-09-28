import { useEffect, useRef } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";
import {
  PARTY_IDENTITY_FIELDS,
  mapPartyToIdentityFill,
  type PartyIdentityFill,
} from "@/features/originacao/mappers/map-party-to-guarantor";
import type { SimulationFormValues } from "@/features/originacao/schemas/simulation-form";
import { partyFillUpdates } from "@/features/originacao/utils/party-fill-updates";

export function useSimulationPartyAutoFill(
  getValues: UseFormGetValues<SimulationFormValues>,
  setValue: UseFormSetValue<SimulationFormValues>,
  initialCpf?: string,
) {
  const { party, status, onCpfChange } = usePartyLookup(initialCpf);
  const filledRef = useRef<PartyIdentityFill>({});

  useEffect(() => {
    const next = party ? mapPartyToIdentityFill(party) : {};
    const updates = partyFillUpdates(
      PARTY_IDENTITY_FIELDS,
      filledRef.current,
      next,
      getValues,
    );
    for (const [field, value] of updates) {
      setValue(field, value, { shouldDirty: true, shouldValidate: !!value });
    }
    filledRef.current = next;
  }, [party, getValues, setValue]);

  return { status, onCpfChange };
}

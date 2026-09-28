import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import {
  GUARANTOR_PARTY_FIELDS,
  mapPartyToGuarantorFill,
  type GuarantorPartyFill,
} from "@/features/originacao/mappers/map-party-to-guarantor";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";

export type { PartyLookupStatus } from "@/features/originacao/hooks/usePartyLookup";

export function useGuarantorPartyAutoFill() {
  const { getValues, setValue } = useFormContext<ProposalFormData>();
  const { party, status, onCpfChange } = usePartyLookup();
  const filledRef = useRef<GuarantorPartyFill>({});

  useEffect(() => {
    const previous = filledRef.current;
    const next = party ? mapPartyToGuarantorFill(party) : {};
    for (const field of GUARANTOR_PARTY_FIELDS) {
      const path = `guarantor.${field}` as const;
      const value = next[field];
      if (value) {
        setValue(path, value, { shouldDirty: true, shouldValidate: true });
      } else if (previous[field] && getValues(path) === previous[field]) {
        setValue(path, "", { shouldDirty: true });
      }
    }
    filledRef.current = next;
  }, [party, getValues, setValue]);

  return { status, onCpfChange };
}

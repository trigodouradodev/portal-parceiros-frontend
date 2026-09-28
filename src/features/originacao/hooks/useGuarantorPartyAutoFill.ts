import { useFormContext } from "react-hook-form";
import {
  mapPartyToGuarantorFill,
  type GuarantorPartyFill,
} from "@/features/originacao/mappers/map-party-to-guarantor";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";

export type { PartyLookupStatus } from "@/features/originacao/hooks/usePartyLookup";

export function useGuarantorPartyAutoFill() {
  const { getValues, setValue } = useFormContext<ProposalFormData>();
  const { status, onCpfComplete, onCpfIncomplete } = usePartyLookup<
    keyof GuarantorPartyFill
  >({
    mapParty: mapPartyToGuarantorFill,
    read: (field) => getValues(`guarantor.${field}`),
    write: (field, value) =>
      setValue(`guarantor.${field}`, value, {
        shouldDirty: true,
        shouldValidate: true,
      }),
    clear: (field) =>
      setValue(`guarantor.${field}`, "", { shouldDirty: true }),
  });

  return { status, onCpfComplete, onCpfIncomplete };
}

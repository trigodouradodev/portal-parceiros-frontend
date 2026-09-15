import { useFormContext } from "react-hook-form";
import { mapPartyToGuarantorFill } from "@/features/originacao/mappers/map-party-to-guarantor";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";

export type { PartyLookupStatus } from "@/features/originacao/hooks/usePartyLookup";

export function useGuarantorPartyAutoFill() {
  const { setValue } = useFormContext<ProposalFormData>();
  const { status, onCpfComplete, onCpfIncomplete } = usePartyLookup((party) => {
    const fill = mapPartyToGuarantorFill(party);
    const options = { shouldDirty: true, shouldValidate: true };
    const fields = [
      "name",
      "email",
      "phone",
      "zipCode",
      "street",
      "number",
      "complement",
      "neighborhood",
      "city",
      "state",
    ] as const;
    for (const field of fields) {
      const value = fill[field];
      if (value) setValue(`guarantor.${field}`, value, options);
    }
  });

  return { status, onCpfComplete, onCpfIncomplete };
}

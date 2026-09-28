import { useEffect, useRef } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import {
  GUARANTOR_PARTY_FIELDS,
  mapPartyToGuarantorFill,
  type GuarantorPartyFill,
} from "@/features/originacao/mappers/map-party-to-guarantor";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { usePartyLookup } from "@/features/originacao/hooks/usePartyLookup";
import { partyFillUpdates } from "@/features/originacao/utils/party-fill-updates";

export type GuarantorPartyAutoFill = ReturnType<
  typeof useGuarantorPartyAutoFill
>;

// Fica no PropostaPage, e não no GuarantorSection: o wizard desmonta a etapa
// ao navegar e perderia o registro do que veio do cadastro.
export function useGuarantorPartyAutoFill(
  getValues: UseFormGetValues<ProposalFormData>,
  setValue: UseFormSetValue<ProposalFormData>,
) {
  const { party, status, onCpfChange } = usePartyLookup();
  const filledRef = useRef<GuarantorPartyFill>({});

  useEffect(() => {
    const next = party ? mapPartyToGuarantorFill(party) : {};
    const updates = partyFillUpdates(
      GUARANTOR_PARTY_FIELDS,
      filledRef.current,
      next,
      (field) => getValues(`guarantor.${field}`),
    );
    for (const [field, value] of updates) {
      setValue(`guarantor.${field}`, value, {
        shouldDirty: true,
        shouldValidate: !!value,
      });
    }
    filledRef.current = next;
  }, [party, getValues, setValue]);

  return { status, onCpfChange };
}

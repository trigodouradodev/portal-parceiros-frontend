import { FormTextarea } from "@/components/ui/rhf-fields";
import { AddressFields } from "@/features/originacao/components/AddressFields";
import type { ProposalFormData } from "@/features/originacao/data/proposal";

export function AddressSection() {
  return (
    <div className="flex flex-col gap-5">
      <AddressFields namePrefix="address" />

      <FormTextarea<ProposalFormData>
        name="address.landmark"
        label="Ponto de referência"
        placeholder="Descreva um local conhecido próximo (ex: perto do shopping, igreja, escola)"
        required
      />
    </div>
  );
}

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { TextareaField } from "@/components/ui/textarea-field";
import { AddressFields } from "@/features/originacao/components/AddressFields";
import {
  CLIENT_MOCK_ADDRESS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";

export function AddressSection() {
  const { control } = useFormContext<ProposalFormData>();

  return (
    <div className="flex flex-col gap-5">
      <AddressFields namePrefix="address" mock={CLIENT_MOCK_ADDRESS} />

      <FormField
        control={control}
        name="address.landmark"
        render={({ field }) => (
          <TextareaField
            name={field.name}
            label="Ponto de referência"
            value={field.value}
            onChange={field.onChange}
            placeholder="Descreva um local conhecido próximo (ex: perto do shopping, igreja, escola)"
          />
        )}
      />
    </div>
  );
}

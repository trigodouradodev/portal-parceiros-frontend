import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Ponto de referência
            </Label>
            <Textarea
              value={field.value}
              onChange={field.onChange}
              placeholder="Descreva um local conhecido próximo (ex: perto do shopping, igreja, escola)"
              className="rounded-2xl"
            />
          </div>
        )}
      />
    </div>
  );
}

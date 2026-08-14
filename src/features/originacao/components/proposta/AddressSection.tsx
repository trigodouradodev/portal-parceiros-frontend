import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MockAddressFields } from "@/features/originacao/components/MockAddressFields";
import {
  CLIENT_MOCK_ADDRESS,
  isAddressValid,
  type AddressData,
} from "@/features/originacao/data/proposal";

interface AddressSectionProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  onValidChange: (valid: boolean) => void;
}

export function AddressSection({
  data,
  onChange,
  onValidChange,
}: AddressSectionProps) {
  useEffect(() => {
    onValidChange(isAddressValid(data));
  }, [data, onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <MockAddressFields
        address={{
          zipCode: data.zipCode,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        }}
        onAddressChange={(address) => onChange({ ...data, ...address })}
        mock={CLIENT_MOCK_ADDRESS}
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Ponto de referência
        </Label>
        <Textarea
          value={data.landmark}
          onChange={(event) =>
            onChange({ ...data, landmark: event.target.value })
          }
          placeholder="Descreva um local conhecido próximo (ex: perto do shopping, igreja, escola)"
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}

import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldLabel, FieldStatusMessage } from "@/components/ui/field-hint";
import { FormInput, FormSelect } from "@/components/ui/rhf-fields";
import { toSelectOptions } from "@/components/ui/select-option";
import { useCepAutoFill } from "@/features/originacao/hooks/useCepAutoFill";
import { useGeoAutoFill } from "@/features/originacao/hooks/useGeoAutoFill";
import {
  UF_LIST,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import {
  addressPath,
  type AddressPrefix,
} from "@/features/originacao/utils/apply-address-fill";
import { formatAddressNumber } from "@/features/originacao/utils/format-address-number";
import {
  formatCep,
  isCompleteCep,
} from "@/features/originacao/utils/format-cep";

interface AddressFieldsProps {
  namePrefix: AddressPrefix;
}

export function AddressFields({ namePrefix }: AddressFieldsProps) {
  const { cepStatus, onZipCodeComplete, onZipCodeIncomplete } =
    useCepAutoFill(namePrefix);
  const { geoStatus, captureLocation, resetGeo } = useGeoAutoFill(namePrefix);
  const searching = cepStatus === "searching";

  function handleZipCodeChange(formatted: string) {
    resetGeo();
    if (isCompleteCep(formatted)) {
      onZipCodeComplete(formatted.replace(/\D/g, ""));
    } else {
      onZipCodeIncomplete();
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Geolocalização</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="pill"
          className="gap-2"
          disabled={geoStatus === "capturing" || searching}
          onClick={() => {
            onZipCodeIncomplete();
            captureLocation();
          }}
        >
          {geoStatus === "capturing" ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Capturando localização…
            </>
          ) : (
            <>
              <MapPin size={15} />
              Recuperar via geolocalização
            </>
          )}
        </Button>
        {geoStatus === "captured" ? (
          <Alert variant="success">
            <CheckCircle2 size={16} />
            <AlertDescription>
              Localização capturada — endereço preenchido automaticamente
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <FormInput<ProposalFormData>
          name={addressPath(namePrefix, "zipCode")}
          label="CEP"
          transform={formatCep}
          onValueChange={handleZipCodeChange}
          icon={<MapPin size={16} />}
          placeholder="00000-000"
          inputMode="numeric"
          maxLength={9}
          required
        />
        {cepStatus === "searching" ? (
          <FieldStatusMessage tone="pending">
            Buscando endereço…
          </FieldStatusMessage>
        ) : null}
        {cepStatus === "found" ? (
          <FieldStatusMessage tone="success">
            Endereço encontrado e preenchido automaticamente
          </FieldStatusMessage>
        ) : null}
      </div>

      <FormInput<ProposalFormData>
        name={addressPath(namePrefix, "street")}
        label="Rua"
        placeholder="Nome da rua"
        required
        disabled={searching}
      />
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <FormInput<ProposalFormData>
          name={addressPath(namePrefix, "number")}
          label="Número"
          transform={formatAddressNumber}
          placeholder="Nº"
          maxLength={10}
          required
        />
        <FormInput<ProposalFormData>
          name={addressPath(namePrefix, "complement")}
          label="Complemento"
          placeholder="Opcional"
        />
      </div>
      <FormInput<ProposalFormData>
        name={addressPath(namePrefix, "neighborhood")}
        label="Bairro"
        placeholder="Bairro"
        required
        disabled={searching}
      />
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <FormInput<ProposalFormData>
          name={addressPath(namePrefix, "city")}
          label="Cidade"
          placeholder="Cidade"
          required
          disabled={searching}
        />
        <FormSelect<ProposalFormData>
          name={addressPath(namePrefix, "state")}
          label="Estado"
          placeholder="UF"
          options={toSelectOptions(UF_LIST)}
          required
          disabled={searching}
        />
      </div>
    </>
  );
}

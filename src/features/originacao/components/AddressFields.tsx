import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { toSelectOptions } from "@/components/ui/select-option";
import { useCepAutoFill } from "@/features/originacao/hooks/useCepAutoFill";
import {
  UF_LIST,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import {
  addressPath,
  applyAddressFill,
  type AddressPrefix,
} from "@/features/originacao/utils/apply-address-fill";
import { formatAddressNumber } from "@/features/originacao/utils/format-address-number";
import {
  formatCep,
  isCompleteCep,
} from "@/features/originacao/utils/format-cep";
import type { CepLookupResult } from "@/services/cep/cep.types";

type GeoStatus = "idle" | "capturing" | "captured";

/** Preenchimento temporário da geolocalização (ainda mock). */
const GEO_MOCK_BY_PREFIX: Record<AddressPrefix, CepLookupResult> = {
  address: {
    zipCode: "01001-000",
    street: "Rua das Flores",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
  },
  guarantor: {
    zipCode: "01310-100",
    street: "Avenida Paulista",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  },
};

interface AddressFieldsProps {
  namePrefix: AddressPrefix;
}

export function AddressFields({ namePrefix }: AddressFieldsProps) {
  const { control, setValue } = useFormContext<ProposalFormData>();
  const { cepStatus, onZipCodeComplete, onZipCodeIncomplete } =
    useCepAutoFill(namePrefix);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const geoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searching = cepStatus === "searching";

  useEffect(() => {
    return () => {
      if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
    };
  }, []);

  function resetGeo() {
    if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
    setGeoStatus("idle");
  }

  function handleCaptureLocation() {
    if (geoStatus === "capturing") return;
    onZipCodeIncomplete();
    setGeoStatus("capturing");
    geoTimerRef.current = setTimeout(() => {
      setGeoStatus("captured");
      applyAddressFill(setValue, namePrefix, GEO_MOCK_BY_PREFIX[namePrefix]);
    }, 1000);
  }

  function handleZipCodeChange(value: string) {
    resetGeo();
    const formatted = formatCep(value);
    setValue(addressPath(namePrefix, "zipCode"), formatted, {
      shouldDirty: true,
    });

    if (isCompleteCep(formatted)) {
      onZipCodeComplete(formatted.replace(/\D/g, ""));
    } else {
      onZipCodeIncomplete();
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Geolocalização
        </Label>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 rounded-2xl"
          disabled={geoStatus === "capturing" || searching}
          onClick={handleCaptureLocation}
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
          <div className="flex items-center gap-2 rounded-2xl bg-[#E6F7F1] px-4 py-3 text-sm font-medium text-[#0F6E56]">
            <CheckCircle2 size={16} />
            Localização capturada — endereço preenchido automaticamente
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <FormField
          control={control}
          name={addressPath(namePrefix, "zipCode")}
          render={({ field, fieldState }) => (
            <InputField
              name={field.name}
              label="CEP"
              value={field.value}
              onChange={handleZipCodeChange}
              icon={<MapPin size={16} />}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
              required
              error={fieldState.error?.message}
            />
          )}
        />
        {cepStatus === "searching" ? (
          <p className="flex items-center gap-1.5 text-xs text-[#6B7080]">
            <Loader2 size={12} className="animate-spin" />
            Buscando endereço…
          </p>
        ) : null}
        {cepStatus === "found" ? (
          <p className="flex items-center gap-1.5 text-xs text-[#0F6E56]">
            <CheckCircle2 size={12} />
            Endereço encontrado e preenchido automaticamente
          </p>
        ) : null}
      </div>

      <FormField
        control={control}
        name={addressPath(namePrefix, "street")}
        render={({ field, fieldState }) => (
          <InputField
            name={field.name}
            label="Rua"
            value={field.value}
            onChange={field.onChange}
            icon={<MapPin size={16} />}
            placeholder="Nome da rua"
            required={namePrefix === "address"}
            disabled={searching}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <FormField
          control={control}
          name={addressPath(namePrefix, "number")}
          render={({ field, fieldState }) => (
            <InputField
              name={field.name}
              label="Número"
              value={field.value}
              onChange={(value) => field.onChange(formatAddressNumber(value))}
              icon={<MapPin size={16} />}
              placeholder="Nº"
              maxLength={10}
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <FormField
          control={control}
          name={addressPath(namePrefix, "complement")}
          render={({ field }) => (
            <InputField
              label="Complemento"
              value={field.value}
              onChange={field.onChange}
              icon={<MapPin size={16} />}
              placeholder="Opcional"
            />
          )}
        />
      </div>
      <FormField
        control={control}
        name={addressPath(namePrefix, "neighborhood")}
        render={({ field, fieldState }) => (
          <InputField
            name={field.name}
            label="Bairro"
            value={field.value}
            onChange={field.onChange}
            icon={<MapPin size={16} />}
            placeholder="Bairro"
            required
            disabled={searching}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <FormField
          control={control}
          name={addressPath(namePrefix, "city")}
          render={({ field, fieldState }) => (
            <InputField
              name={field.name}
              label="Cidade"
              value={field.value}
              onChange={field.onChange}
              icon={<MapPin size={16} />}
              placeholder="Cidade"
              required
              disabled={searching}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormField
          control={control}
          name={addressPath(namePrefix, "state")}
          render={({ field, fieldState }) => (
            <SelectDialogField
              name={field.name}
              label="Estado"
              value={field.value}
              onChange={field.onChange}
              placeholder="UF"
              options={toSelectOptions(UF_LIST)}
              required
              disabled={searching}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>
    </>
  );
}

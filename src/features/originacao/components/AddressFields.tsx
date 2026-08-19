import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { toSelectOptions } from "@/components/ui/select-option";
import {
  UF_LIST,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatAddressNumber } from "@/features/originacao/utils/format-address-number";
import { formatCep } from "@/features/originacao/utils/format-cep";

export interface AddressFill {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

type AddressPrefix = "address" | "guarantor";
type AddressFieldName =
  | "zipCode"
  | "street"
  | "number"
  | "complement"
  | "neighborhood"
  | "city"
  | "state";

type GeoStatus = "idle" | "capturing" | "captured";
type CepStatus = "idle" | "searching" | "found";

function addressPath<F extends AddressFieldName>(
  prefix: AddressPrefix,
  field: F,
): `${AddressPrefix}.${F}` {
  return `${prefix}.${field}`;
}

interface AddressFieldsProps {
  namePrefix: AddressPrefix;
  mock: AddressFill;
}

export function AddressFields({ namePrefix, mock }: AddressFieldsProps) {
  const { control, setValue } = useFormContext<ProposalFormData>();
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const geoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
      if (cepTimerRef.current) clearTimeout(cepTimerRef.current);
    };
  }, []);

  function applyMock(zipCode: string) {
    setValue(addressPath(namePrefix, "zipCode"), zipCode, {
      shouldDirty: true,
    });
    setValue(addressPath(namePrefix, "street"), mock.street, {
      shouldDirty: true,
    });
    setValue(addressPath(namePrefix, "neighborhood"), mock.neighborhood, {
      shouldDirty: true,
    });
    setValue(addressPath(namePrefix, "city"), mock.city, { shouldDirty: true });
    setValue(addressPath(namePrefix, "state"), mock.state, {
      shouldDirty: true,
    });
  }

  function handleCaptureLocation() {
    if (geoStatus !== "idle") return;
    setGeoStatus("capturing");
    geoTimerRef.current = setTimeout(() => {
      setGeoStatus("captured");
      applyMock(mock.zipCode);
    }, 1000);
  }

  function handleZipCodeChange(value: string) {
    const formatted = formatCep(value);
    setValue(addressPath(namePrefix, "zipCode"), formatted, {
      shouldDirty: true,
    });
    if (cepTimerRef.current) clearTimeout(cepTimerRef.current);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      setCepStatus("searching");
      cepTimerRef.current = setTimeout(() => {
        setCepStatus("found");
        applyMock(formatted);
      }, 700);
    } else {
      setCepStatus("idle");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Geolocalização
        </Label>
        {geoStatus !== "captured" ? (
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-2xl"
            disabled={geoStatus === "capturing"}
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
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-[#E6F7F1] px-4 py-3 text-sm font-medium text-[#0F6E56]">
            <CheckCircle2 size={16} />
            Localização capturada — endereço preenchido automaticamente
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <FormField
          control={control}
          name={addressPath(namePrefix, "zipCode")}
          render={({ field }) => (
            <InputField
              label="CEP"
              value={field.value}
              onChange={handleZipCodeChange}
              icon={<MapPin size={16} />}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
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
        render={({ field }) => (
          <InputField
            label="Rua"
            value={field.value}
            onChange={field.onChange}
            icon={<MapPin size={16} />}
            placeholder="Nome da rua"
          />
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name={addressPath(namePrefix, "number")}
          render={({ field }) => (
            <InputField
              label="Número"
              value={field.value}
              onChange={(value) => field.onChange(formatAddressNumber(value))}
              icon={<MapPin size={16} />}
              placeholder="Nº"
              maxLength={10}
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
        render={({ field }) => (
          <InputField
            label="Bairro"
            value={field.value}
            onChange={field.onChange}
            icon={<MapPin size={16} />}
            placeholder="Bairro"
          />
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name={addressPath(namePrefix, "city")}
          render={({ field }) => (
            <InputField
              label="Cidade"
              value={field.value}
              onChange={field.onChange}
              icon={<MapPin size={16} />}
              placeholder="Cidade"
            />
          )}
        />
        <FormField
          control={control}
          name={addressPath(namePrefix, "state")}
          render={({ field }) => (
            <SelectField
              label="Estado"
              value={field.value}
              onChange={field.onChange}
              placeholder="UF"
              options={toSelectOptions(UF_LIST)}
            />
          )}
        />
      </div>
    </>
  );
}

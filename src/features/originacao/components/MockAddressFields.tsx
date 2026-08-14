import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OriginacaoFieldInput } from "@/features/originacao/components/OriginacaoFieldInput";
import { UF_LIST } from "@/features/originacao/data/proposal";
import { formatAddressNumber } from "@/features/originacao/utils/format-address-number";
import { formatCep } from "@/features/originacao/utils/format-cep";

export interface MockAddressValue {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface MockAddressFill {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

type GeoStatus = "idle" | "capturing" | "captured";
type CepStatus = "idle" | "searching" | "found";

interface MockAddressFieldsProps {
  address: MockAddressValue;
  onAddressChange: (address: MockAddressValue) => void;
  mock: MockAddressFill;
}

export function MockAddressFields({
  address,
  onAddressChange,
  mock,
}: MockAddressFieldsProps) {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const addressRef = useRef(address);
  const geoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  useEffect(() => {
    return () => {
      if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
      if (cepTimerRef.current) clearTimeout(cepTimerRef.current);
    };
  }, []);

  function patch(next: Partial<MockAddressValue>) {
    onAddressChange({ ...address, ...next });
  }

  function applyMock(zipCode: string) {
    onAddressChange({
      ...addressRef.current,
      zipCode,
      street: mock.street,
      neighborhood: mock.neighborhood,
      city: mock.city,
      state: mock.state,
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
    patch({ zipCode: formatted });
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
        <OriginacaoFieldInput
          label="CEP"
          value={address.zipCode}
          onChange={handleZipCodeChange}
          icon={<MapPin size={16} />}
          placeholder="00000-000"
          inputMode="numeric"
          maxLength={9}
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

      <OriginacaoFieldInput
        label="Rua"
        value={address.street}
        onChange={(street) => patch({ street })}
        icon={<MapPin size={16} />}
        placeholder="Nome da rua"
      />
      <div className="grid grid-cols-2 gap-3">
        <OriginacaoFieldInput
          label="Número"
          value={address.number}
          onChange={(number) => patch({ number: formatAddressNumber(number) })}
          icon={<MapPin size={16} />}
          placeholder="Nº"
          maxLength={10}
        />
        <OriginacaoFieldInput
          label="Complemento"
          value={address.complement}
          onChange={(complement) => patch({ complement })}
          icon={<MapPin size={16} />}
          placeholder="Opcional"
        />
      </div>
      <OriginacaoFieldInput
        label="Bairro"
        value={address.neighborhood}
        onChange={(neighborhood) => patch({ neighborhood })}
        icon={<MapPin size={16} />}
        placeholder="Bairro"
      />
      <div className="grid grid-cols-2 gap-3">
        <OriginacaoFieldInput
          label="Cidade"
          value={address.city}
          onChange={(city) => patch({ city })}
          icon={<MapPin size={16} />}
          placeholder="Cidade"
        />
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-[#1A1D2E]">Estado</Label>
          <Select
            value={address.state || undefined}
            onValueChange={(state) => patch({ state })}
          >
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {UF_LIST.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}

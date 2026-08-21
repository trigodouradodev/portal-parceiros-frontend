import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  applyAddressFill,
  type AddressPrefix,
} from "@/features/originacao/utils/apply-address-fill";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import type { CepLookupResult } from "@/services/cep/cep.types";

export type GeoStatus = "idle" | "capturing" | "captured";

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

export function useGeoAutoFill(namePrefix: AddressPrefix) {
  const { setValue } = useFormContext<ProposalFormData>();
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const geoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
    };
  }, []);

  function resetGeo() {
    if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
    setGeoStatus("idle");
  }

  function captureLocation() {
    if (geoStatus === "capturing") return;
    setGeoStatus("capturing");
    geoTimerRef.current = setTimeout(() => {
      setGeoStatus("captured");
      applyAddressFill(setValue, namePrefix, GEO_MOCK_BY_PREFIX[namePrefix]);
    }, 1000);
  }

  return { geoStatus, captureLocation, resetGeo };
}

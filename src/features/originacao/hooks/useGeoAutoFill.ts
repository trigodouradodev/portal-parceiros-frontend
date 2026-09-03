import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { useToast } from "@/contexts/toast/toast-context";
import {
  formatGeoPrecision,
  mapReverseGeocodeToFill,
} from "@/features/originacao/mappers/map-reverse-geocode-to-fill";
import {
  applyGeoAddressFill,
  type AddressPrefix,
} from "@/features/originacao/utils/apply-address-fill";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { getApiErrorMessage } from "@/lib/api/errors";
import { roundGeoCoordinate } from "@/services/locations/geo-coords";
import {
  locationsKeys,
  locationsService,
} from "@/services/locations/locations.service";
import type { ReverseGeocodedAddress } from "@/services/locations/locations.types";

export type GeoStatus = "idle" | "capturing" | "captured";

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0,
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

function geoPositionErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return "Permissão de localização negada. Habilite o GPS no navegador.";
  }
  if (error.code === error.TIMEOUT) {
    return "Tempo esgotado ao obter a localização.";
  }
  return "Não foi possível obter a localização.";
}

export function useGeoAutoFill(namePrefix: AddressPrefix) {
  const { setValue } = useFormContext<ProposalFormData>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  function clearAddressGeolocation() {
    if (namePrefix === "address") {
      setValue("address.geolocation", null, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }

  function resetGeo() {
    requestIdRef.current += 1;
    setGeoStatus("idle");
    clearAddressGeolocation();
  }

  function captureLocation() {
    if (geoStatus === "capturing") return;

    if (!navigator.geolocation) {
      showToast("Geolocalização não é suportada neste dispositivo.", {
        variant: "destructive",
      });
      return;
    }

    const requestId = ++requestIdRef.current;
    setGeoStatus("capturing");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void resolveAddress(requestId, position);
      },
      (error) => {
        if (requestId !== requestIdRef.current) return;
        setGeoStatus("idle");
        showToast(geoPositionErrorMessage(error), { variant: "destructive" });
      },
      GEO_OPTIONS,
    );
  }

  async function resolveAddress(
    requestId: number,
    position: GeolocationPosition,
  ) {
    const latitude = roundGeoCoordinate(position.coords.latitude);
    const longitude = roundGeoCoordinate(position.coords.longitude);
    const precision = formatGeoPrecision(position.coords.accuracy);

    try {
      const data = await queryClient.fetchQuery({
        queryKey: locationsKeys.reverseGeocode(latitude, longitude),
        queryFn: ({ signal }) =>
          locationsService.reverseGeocode(latitude, longitude, signal),
        staleTime: 60 * 60 * 1000,
        retry: false,
      });

      if (requestId !== requestIdRef.current) return;

      applyFill(data, { latitude, longitude, precision });
      setGeoStatus("captured");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      if (isAbortError(error)) return;

      setGeoStatus("idle");
      queryClient.removeQueries({
        queryKey: locationsKeys.reverseGeocode(latitude, longitude),
      });
      showToast(
        getApiErrorMessage(
          error,
          "Não foi possível buscar o endereço pela localização.",
        ),
        { variant: "destructive" },
      );
    }
  }

  function applyFill(
    data: ReverseGeocodedAddress,
    geolocation: {
      latitude: number;
      longitude: number;
      precision: string;
    },
  ) {
    applyGeoAddressFill(setValue, namePrefix, mapReverseGeocodeToFill(data));
    if (namePrefix === "address") {
      setValue("address.geolocation", geolocation, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }

  return { geoStatus, captureLocation, resetGeo };
}

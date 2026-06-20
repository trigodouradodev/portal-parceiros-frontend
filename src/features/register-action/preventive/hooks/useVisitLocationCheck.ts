import { useCallback, useState } from "react";
import { useToast } from "@/contexts/toast/toast-context";
import { useVerifyLocation } from "@/hooks/useVerifyLocation";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";

export type VisitLocationStatus =
  | "idle"
  | "checking"
  | "confirmed"
  | "not_found"
  | "manual";

interface UseVisitLocationCheckOptions {
  contractId: string;
  installmentNumber: number;
  onPartialMatch?: () => void;
}

export function useVisitLocationCheck({
  contractId,
  installmentNumber,
  onPartialMatch,
}: UseVisitLocationCheckOptions) {
  const { showToast } = useToast();
  const verifyLocation = useVerifyLocation();
  const [status, setStatus] = useState<VisitLocationStatus>("idle");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [result, setResult] = useState<LocationCheckResult | null>(null);

  const locationOk = status === "confirmed" || status === "manual";

  const confirmManual = useCallback(() => {
    setStatus("manual");
  }, []);

  const verify = useCallback(() => {
    setStatus("checking");
    setResult(null);

    if (!navigator.geolocation) {
      showToast("Geolocalização não disponível neste dispositivo.", {
        variant: "destructive",
      });
      setStatus("idle");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const positionCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        verifyLocation
          .mutateAsync({
            contractId,
            installmentNumber,
            latitude: positionCoords.latitude,
            longitude: positionCoords.longitude,
          })
          .then((checkResult) => {
            setCoords(positionCoords);
            setResult(checkResult);
            setStatus(checkResult.withinRadius ? "confirmed" : "not_found");

            if (checkResult.partialMatch) {
              if (onPartialMatch) {
                onPartialMatch();
              } else {
                showToast(
                  "Endereço geolocalizado de forma aproximada. Confirme manualmente se necessário.",
                  { variant: "info" },
                );
              }
            }
          })
          .catch((err) => {
            showToast(
              getApiErrorMessage(
                err,
                "Não foi possível verificar a localização.",
              ),
              { variant: "destructive" },
            );
            setStatus("idle");
          });
      },
      () => {
        showToast("Não foi possível obter sua localização.", {
          variant: "destructive",
        });
        setStatus("idle");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, [
    contractId,
    installmentNumber,
    onPartialMatch,
    showToast,
    verifyLocation,
  ]);

  return {
    status,
    result,
    coords,
    verify,
    confirmManual,
    locationOk,
  };
}

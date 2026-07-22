import { useCallback, useRef, useState } from "react";
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
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState<VisitLocationStatus>("idle");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [result, setResult] = useState<LocationCheckResult | null>(null);

  const locationOk = status === "confirmed" || status === "manual";

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setStatus("idle");
    setCoords(null);
    setResult(null);
  }, []);

  const confirmManual = useCallback(() => {
    setStatus("manual");
  }, []);

  const verify = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setStatus("checking");
    setResult(null);

    if (!navigator.geolocation) {
      if (requestId === requestIdRef.current) {
        // Sem API de localização: libera as mesmas alternativas do "fora do raio".
        setStatus("not_found");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== requestIdRef.current) return;

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
            if (requestId !== requestIdRef.current) return;

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
            if (requestId !== requestIdRef.current) return;

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
        if (requestId !== requestIdRef.current) return;

        // Sem posição (permissão negada, timeout, GPS indisponível):
        // mostra aviso + alternativas manuais, em vez de travar no idle.
        setStatus("not_found");
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
    reset,
    locationOk,
  };
}

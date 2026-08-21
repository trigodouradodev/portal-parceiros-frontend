import { useCallback, useRef, useState } from "react";
import { useToast } from "@/contexts/toast/toast-context";
import { useVerifyLocation } from "@/hooks/useVerifyLocation";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";
import {
  FollowUpParty,
  type FollowUpParty as FollowUpPartyValue,
} from "@/services/followup/followup.types";

export type VisitLocationStatus =
  | "idle"
  | "checking"
  | "confirmed"
  | "not_found"
  | "manual";

interface UseVisitLocationCheckOptions {
  contractId: string;
  installmentNumber: number;
  party?: FollowUpPartyValue;
  onPartialMatch?: () => void;
}

export function useVisitLocationCheck({
  contractId,
  installmentNumber,
  party = FollowUpParty.CLIENT,
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
            party,
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
        setStatus("not_found");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, [
    contractId,
    installmentNumber,
    onPartialMatch,
    party,
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

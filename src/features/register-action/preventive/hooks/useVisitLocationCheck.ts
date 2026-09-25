import { useCallback, useRef, useState } from "react";
import { useToast } from "@/contexts/toast/toast-context";
import type { ManualLocationReason } from "@/features/register-action/preventive/constants/manual-location-reason";
import {
  applyVisitLocationTolerance,
  type VisitLocationDecision,
} from "@/features/register-action/preventive/utils/apply-visit-location-tolerance";
import { useVerifyLocation } from "@/hooks/useVerifyLocation";
import {
  mapGeoPositionError,
  readGeoPermissionState,
  retryStillBlocked,
  WEAK_GPS_ACCURACY_METERS,
  type GeoFailureReason,
  type GeoPermissionState,
} from "@/lib/geo/geo-position-error";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  FollowUpParty,
  type FollowUpParty as FollowUpPartyValue,
} from "@/services/followup/followup.types";

export type VisitLocationStatus =
  | "idle"
  | "locating"
  | "checking"
  | "confirmed"
  | "not_found"
  | "manual";

export type { GeoFailureReason, ManualLocationReason };

interface UseVisitLocationCheckOptions {
  contractId: string;
  installmentNumber: number;
  party?: FollowUpPartyValue;
  onPartialMatch?: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  timeout: 15_000,
  enableHighAccuracy: true,
  maximumAge: 0,
};

const BLOCKED_LOCATION_TOAST = "Ainda não deu. Siga os passos do aviso acima.";

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
  const [result, setResult] = useState<VisitLocationDecision | null>(null);
  const [geoFailureReason, setGeoFailureReason] =
    useState<GeoFailureReason | null>(null);
  const [geoPermissionState, setGeoPermissionState] =
    useState<GeoPermissionState | null>(null);
  const [manualReason, setManualReason] = useState<ManualLocationReason | null>(
    null,
  );
  const [manualNote, setManualNote] = useState<string | null>(null);

  const locationOk = status === "confirmed" || status === "manual";

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setStatus("idle");
    setCoords(null);
    setResult(null);
    setGeoFailureReason(null);
    setGeoPermissionState(null);
    setManualReason(null);
    setManualNote(null);
  }, []);

  const confirmManual = useCallback(
    (reason: ManualLocationReason, note?: string) => {
      setManualReason(reason);
      setManualNote(note?.trim() || null);
      setStatus("manual");
    },
    [],
  );

  const beginGeolocationRequest = useCallback(
    (requestId: number) => {
      setStatus("locating");
      setCoords(null);
      setResult(null);
      setGeoFailureReason(null);
      setGeoPermissionState(null);
      setManualReason(null);
      setManualNote(null);

      if (!navigator.geolocation) {
        if (requestId === requestIdRef.current) {
          setGeoFailureReason("unsupported");
          setStatus("not_found");
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (requestId !== requestIdRef.current) return;

          const accuracyMeters = position.coords.accuracy;
          if (
            Number.isFinite(accuracyMeters) &&
            accuracyMeters > WEAK_GPS_ACCURACY_METERS
          ) {
            showToast(
              "Sinal de GPS fraco. Aproxime-se de uma janela ou área aberta se a confirmação falhar.",
              { variant: "info" },
            );
          }

          const positionCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setStatus("checking");

          verifyLocation
            .mutateAsync({
              contractId,
              installmentNumber,
              party,
              latitude: positionCoords.latitude,
              longitude: positionCoords.longitude,
              accuracyMeters: Number.isFinite(accuracyMeters)
                ? accuracyMeters
                : undefined,
            })
            .then((checkResult) => {
              if (requestId !== requestIdRef.current) return;

              const decision = applyVisitLocationTolerance(checkResult);

              setCoords(positionCoords);
              setResult(decision);
              setStatus(decision.withinRadius ? "confirmed" : "not_found");

              if (decision.partialMatch) {
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
        (error) => {
          if (requestId !== requestIdRef.current) return;
          const reason = mapGeoPositionError(error);
          setGeoFailureReason(reason);
          if (reason !== "permission_denied") {
            setGeoPermissionState(null);
            setStatus("not_found");
            return;
          }
          readGeoPermissionState()
            .then((state) => {
              if (requestId !== requestIdRef.current) return;
              setGeoPermissionState(state);
              setStatus("not_found");
            })
            .catch(() => {
              if (requestId !== requestIdRef.current) return;
              setGeoPermissionState("unknown");
              setStatus("not_found");
            });
        },
        GEO_OPTIONS,
      );
    },
    [
      contractId,
      installmentNumber,
      onPartialMatch,
      party,
      showToast,
      verifyLocation,
    ],
  );

  const verify = useCallback(() => {
    const requestId = ++requestIdRef.current;
    const failureAtClick = geoFailureReason;
    const permissionAtClick = geoPermissionState;

    const continueVerification = async () => {
      if (failureAtClick === "permission_denied") {
        const latest = await readGeoPermissionState();
        if (requestId !== requestIdRef.current) return;
        if (retryStillBlocked(failureAtClick, permissionAtClick, latest)) {
          setGeoPermissionState(latest);
          setStatus("not_found");
          showToast(BLOCKED_LOCATION_TOAST, { variant: "info" });
          return;
        }
      }

      if (requestId !== requestIdRef.current) return;
      beginGeolocationRequest(requestId);
    };

    continueVerification().catch(() => {
      if (requestId !== requestIdRef.current) return;
      beginGeolocationRequest(requestId);
    });
  }, [
    beginGeolocationRequest,
    geoFailureReason,
    geoPermissionState,
    showToast,
  ]);

  return {
    status,
    result,
    coords,
    geoFailureReason,
    geoPermissionState,
    manualReason,
    manualNote,
    verify,
    confirmManual,
    reset,
    locationOk,
  };
}

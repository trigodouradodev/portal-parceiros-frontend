import { hasValidAddress } from "@/lib/contact-actions";
import type {
  GeoFailureReason,
  GeoPermissionState,
} from "@/lib/geo/geo-position-error";
import type { ManualLocationReason } from "@/features/register-action/preventive/constants/manual-location-reason";
import type { VisitLocationDecision } from "@/features/register-action/preventive/utils/apply-visit-location-tolerance";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";
import type { VisitLocationStatus } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import { GuidanceCard } from "@/features/register-action/components/primitives/contact/GuidanceCard";
import { ClientAddressCard } from "./visit-location/ClientAddressCard";
import {
  CheckingStatus,
  ConfirmedStatus,
  IdleStatus,
  ManualStatus,
  NotFoundStatus,
} from "./visit-location/states";

export type { VisitLocationStatus };

interface VisitLocationPanelProps {
  address?: ClientAddress;
  addressLabel?: string;
  orientationScript?: string;
  status: VisitLocationStatus;
  locationCheckResult?: VisitLocationDecision | null;
  geoFailureReason?: GeoFailureReason | null;
  geoPermissionState?: GeoPermissionState | null;
  onVerifyLocation: () => void;
  onConfirmManual: (reason: ManualLocationReason) => void;
}

export function VisitLocationPanel({
  address,
  addressLabel = "Endereço do cliente",
  orientationScript,
  status,
  locationCheckResult,
  geoFailureReason = null,
  geoPermissionState = null,
  onVerifyLocation,
  onConfirmManual,
}: VisitLocationPanelProps) {
  const hasAddress = hasValidAddress(address);
  const showIdle = hasAddress && status === "idle";
  const showLocating = hasAddress && status === "locating";
  const showChecking = hasAddress && status === "checking";
  const showConfirmed = hasAddress && status === "confirmed";
  const showManual = hasAddress && status === "manual";
  const showNotFound = hasAddress && status === "not_found";
  const unreliablePin = Boolean(
    locationCheckResult?.addressLikelyWrong ||
    locationCheckResult?.partialMatch,
  );

  return (
    <div className="flex flex-col gap-4">
      <ClientAddressCard address={address} label={addressLabel} />

      {orientationScript && (
        <GuidanceCard
          title="Orientações para a visita"
          body={orientationScript}
        />
      )}

      {!hasAddress && (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Não é possível verificar a localização sem endereço cadastrado.
        </p>
      )}

      {showIdle && <IdleStatus onVerifyLocation={onVerifyLocation} />}
      {showLocating && <CheckingStatus phase="locating" />}
      {showChecking && <CheckingStatus phase="checking" />}
      {showConfirmed && (
        <ConfirmedStatus
          distanceMeters={locationCheckResult?.distanceMeters}
          radiusMeters={
            locationCheckResult?.effectiveRadiusMeters ??
            locationCheckResult?.radiusMeters
          }
          partialMatch={locationCheckResult?.partialMatch}
          confirmationLevel={locationCheckResult?.confirmationLevel}
        />
      )}
      {showManual && <ManualStatus />}
      {showNotFound && (
        <NotFoundStatus
          address={address}
          destinationCoordinates={
            unreliablePin
              ? undefined
              : locationCheckResult?.registeredCoordinates
          }
          distanceMeters={locationCheckResult?.distanceMeters}
          radiusMeters={
            locationCheckResult?.proximityRadiusMeters ??
            locationCheckResult?.radiusMeters
          }
          addressLikelyWrong={locationCheckResult?.addressLikelyWrong}
          matchedAddress={locationCheckResult?.matchedAddress}
          geoFailureReason={geoFailureReason}
          geoPermissionState={geoPermissionState}
          onConfirmManual={onConfirmManual}
          onRetry={onVerifyLocation}
        />
      )}
    </div>
  );
}

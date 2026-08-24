import { hasValidAddress } from "@/lib/contact-actions";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";
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
  locationCheckResult?: LocationCheckResult | null;
  onVerifyLocation: () => void;
  onConfirmManual: () => void;
}

export function VisitLocationPanel({
  address,
  addressLabel = "Endereço do cliente",
  orientationScript,
  status,
  locationCheckResult,
  onVerifyLocation,
  onConfirmManual,
}: VisitLocationPanelProps) {
  const hasAddress = hasValidAddress(address);
  const showIdle = hasAddress && status === "idle";
  const showChecking = hasAddress && status === "checking";
  const showConfirmed = hasAddress && status === "confirmed";
  const showManual = hasAddress && status === "manual";
  const showNotFound = hasAddress && status === "not_found";

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
      {showChecking && <CheckingStatus />}
      {showConfirmed && (
        <ConfirmedStatus
          distanceMeters={locationCheckResult?.distanceMeters}
          radiusMeters={locationCheckResult?.radiusMeters}
          partialMatch={locationCheckResult?.partialMatch}
        />
      )}
      {showManual && <ManualStatus />}
      {showNotFound && (
        <NotFoundStatus
          address={address}
          destinationCoordinates={locationCheckResult?.registeredCoordinates}
          distanceMeters={locationCheckResult?.distanceMeters}
          radiusMeters={locationCheckResult?.radiusMeters}
          addressLikelyWrong={locationCheckResult?.addressLikelyWrong}
          onConfirmManual={onConfirmManual}
        />
      )}
    </div>
  );
}

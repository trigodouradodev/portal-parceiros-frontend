import { hasValidAddress } from "@/lib/contact-actions";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";
import type { VisitLocationStatus } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
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
  status: VisitLocationStatus;
  locationCheckResult?: LocationCheckResult | null;
  onVerifyLocation: () => void;
  onConfirmManual: () => void;
}

export function VisitLocationPanel({
  address,
  status,
  locationCheckResult,
  onVerifyLocation,
  onConfirmManual,
}: VisitLocationPanelProps) {
  const hasAddress = hasValidAddress(address);

  return (
    <div className="flex flex-col gap-4">
      <ClientAddressCard address={address} />

      {!hasAddress && (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Não é possível verificar a localização sem endereço cadastrado.
        </p>
      )}

      {hasAddress && status === "idle" && (
        <IdleStatus onVerifyLocation={onVerifyLocation} />
      )}
      {hasAddress && status === "checking" && <CheckingStatus />}
      {hasAddress && status === "confirmed" && (
        <ConfirmedStatus
          distanceMeters={locationCheckResult?.distanceMeters}
          radiusMeters={locationCheckResult?.radiusMeters}
          partialMatch={locationCheckResult?.partialMatch}
        />
      )}
      {hasAddress && status === "manual" && <ManualStatus />}
      {hasAddress && status === "not_found" && (
        <NotFoundStatus
          address={address}
          destinationCoordinates={locationCheckResult?.registeredCoordinates}
          distanceMeters={locationCheckResult?.distanceMeters}
          radiusMeters={locationCheckResult?.radiusMeters}
          onConfirmManual={onConfirmManual}
        />
      )}
    </div>
  );
}

import { MapPin } from "lucide-react";
import {
  formatClientAddress,
  hasValidAddress,
} from "@/lib/contact-actions";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";
import {
  CheckingStatus,
  ConfirmedStatus,
  IdleStatus,
  ManualStatus,
  NotFoundStatus,
} from "./visit-location";

export type VisitLocationStatus =
  | "idle"
  | "checking"
  | "confirmed"
  | "not_found"
  | "manual";

interface PrevVisitLocationPanelProps {
  address?: ClientAddress;
  status: VisitLocationStatus;
  locationCheckResult?: LocationCheckResult | null;
  onVerifyLocation: () => void;
  onConfirmManual: () => void;
}

export function PrevVisitLocationPanel({
  address,
  status,
  locationCheckResult,
  onVerifyLocation,
  onConfirmManual,
}: PrevVisitLocationPanelProps) {
  const hasAddress = hasValidAddress(address);
  const formattedAddress = hasAddress ? formatClientAddress(address!) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl bg-background p-4">
        <MapPin size={18} className="mt-0.5 shrink-0 text-brand-navy" />
        <div>
          <p className="mb-0.5 text-xs text-muted-foreground">
            Endereço do cliente
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formattedAddress ?? "Endereço não cadastrado"}
          </p>
        </div>
      </div>

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

import { ContactToneBadges } from "@/features/register-action/charge/components/ContactToneBadges";
import { VisitLocationPanel } from "@/features/register-action/preventive/components";
import type { ManualLocationReason } from "@/features/register-action/preventive/constants/manual-location-reason";
import type { VisitLocationStatus } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import type { VisitLocationDecision } from "@/features/register-action/preventive/utils/apply-visit-location-tolerance";
import type {
  GeoFailureReason,
  GeoPermissionState,
} from "@/lib/geo/geo-position-error";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";
import type { QueueTone } from "@/services/activities/activity.enums";

interface ChargeVisitStepProps {
  queueTone?: QueueTone | string;
  address?: ClientAddress;
  addressLabel: string;
  orientationScript: string;
  status: VisitLocationStatus;
  locationCheckResult?: VisitLocationDecision | null;
  geoFailureReason?: GeoFailureReason | null;
  geoPermissionState?: GeoPermissionState | null;
  onVerifyLocation: () => void;
  onConfirmManual: (reason: ManualLocationReason, note?: string) => void;
}

export function ChargeVisitStep({
  queueTone,
  address,
  addressLabel,
  orientationScript,
  status,
  locationCheckResult,
  geoFailureReason,
  geoPermissionState,
  onVerifyLocation,
  onConfirmManual,
}: ChargeVisitStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <ContactToneBadges queueTone={queueTone} variant="withDescription" />
      <VisitLocationPanel
        address={address}
        addressLabel={addressLabel}
        orientationScript={orientationScript}
        status={status}
        locationCheckResult={locationCheckResult}
        geoFailureReason={geoFailureReason}
        geoPermissionState={geoPermissionState}
        onVerifyLocation={onVerifyLocation}
        onConfirmManual={onConfirmManual}
      />
    </div>
  );
}

import { ContactToneBadges } from "@/features/register-action/charge/components/ContactToneBadges";
import { VisitLocationPanel } from "@/features/register-action/preventive/components";
import type { VisitLocationStatus } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";
import type { QueueTone } from "@/services/activities/activity.enums";

interface ChargeVisitStepProps {
  queueTone?: QueueTone | string;
  address?: ClientAddress;
  addressLabel: string;
  orientationScript: string;
  status: VisitLocationStatus;
  locationCheckResult?: LocationCheckResult | null;
  onVerifyLocation: () => void;
  onConfirmManual: () => void;
}

export function ChargeVisitStep({
  queueTone,
  address,
  addressLabel,
  orientationScript,
  status,
  locationCheckResult,
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
        onVerifyLocation={onVerifyLocation}
        onConfirmManual={onConfirmManual}
      />
    </div>
  );
}

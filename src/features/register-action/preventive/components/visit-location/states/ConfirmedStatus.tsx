import { CheckCircle2 } from "lucide-react";
import { ActionHint } from "@/features/register-action/components/primitives/contact/ActionHint";
import { PartialMatchAlert } from "../PartialMatchAlert";
import { VisitDistanceLabel } from "../VisitDistanceLabel";

interface ConfirmedStatusProps {
  distanceMeters?: number;
  radiusMeters?: number;
  partialMatch?: boolean;
}

export function ConfirmedStatus({
  distanceMeters,
  radiusMeters,
  partialMatch = false,
}: ConfirmedStatusProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-success-bg py-4 font-semibold text-success">
        <CheckCircle2 size={18} />
        Localização confirmada — você está no endereço!
      </div>
      <ActionHint variant="visit-confirmed" />
      <VisitDistanceLabel
        distanceMeters={distanceMeters}
        radiusMeters={radiusMeters}
        variant="confirmed"
      />
      {partialMatch && <PartialMatchAlert />}
    </div>
  );
}

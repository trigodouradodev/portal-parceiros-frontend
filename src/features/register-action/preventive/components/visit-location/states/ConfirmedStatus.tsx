import { CheckCircle2 } from "lucide-react";
import { ActionHint } from "@/features/register-action/components/primitives/contact/ActionHint";
import type { LocationConfirmationLevel } from "@/features/register-action/preventive/utils/apply-visit-location-tolerance";
import { PartialMatchAlert } from "../PartialMatchAlert";
import { VisitDistanceLabel } from "../VisitDistanceLabel";

interface ConfirmedStatusProps {
  distanceMeters?: number;
  radiusMeters?: number;
  partialMatch?: boolean;
  confirmationLevel?: LocationConfirmationLevel | null;
}

export function ConfirmedStatus({
  distanceMeters,
  radiusMeters,
  partialMatch = false,
  confirmationLevel = "exact",
}: ConfirmedStatusProps) {
  const byProximity = confirmationLevel === "proximity";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-success-bg py-4 font-semibold text-success">
        <CheckCircle2 size={18} />
        {byProximity
          ? "Localização confirmada por proximidade"
          : "Localização confirmada — você está no endereço!"}
      </div>
      {byProximity && (
        <p className="rounded-2xl border border-success/30 bg-success-bg/50 px-3.5 py-2.5 text-xs text-muted-foreground">
          Você está perto do endereço cadastrado (fora do raio exato). A visita
          foi liberada com selo de proximidade para auditoria.
        </p>
      )}
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

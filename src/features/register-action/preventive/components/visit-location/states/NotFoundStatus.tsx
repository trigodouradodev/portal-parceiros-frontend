import { MapPinOff } from "lucide-react";
import { ManualVisitConfirm } from "../ManualVisitConfirm";
import { NavigateToAddressButton } from "../NavigateToAddressButton";
import { VisitDistanceLabel } from "../VisitDistanceLabel";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";

interface NotFoundStatusProps {
  address?: ClientAddress;
  destinationCoordinates?: { latitude: number; longitude: number };
  distanceMeters?: number;
  radiusMeters?: number;
  onConfirmManual: () => void;
}

export function NotFoundStatus({
  address,
  destinationCoordinates,
  distanceMeters,
  radiusMeters,
  onConfirmManual,
}: NotFoundStatusProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive-bg p-4">
        <MapPinOff size={18} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">
            Você não está no endereço
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <VisitDistanceLabel
              distanceMeters={distanceMeters}
              radiusMeters={radiusMeters}
              variant="not_found"
              centered={false}
            />
            {distanceMeters === undefined
              ? "Não foi possível obter sua localização. Vá ao endereço ou confirme presença manualmente."
              : "Para registrar a visita, vá ao endereço ou confirme presença manualmente."}
          </p>
        </div>
      </div>
      <NavigateToAddressButton
        address={address}
        destinationCoordinates={destinationCoordinates}
      />
      <ManualVisitConfirm onConfirmManual={onConfirmManual} />
    </div>
  );
}

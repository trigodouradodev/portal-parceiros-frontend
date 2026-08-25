import { MapPinOff } from "lucide-react";
import { AddressMismatchAlert } from "../AddressMismatchAlert";
import { ManualVisitConfirm } from "../ManualVisitConfirm";
import { NavigateToAddressButton } from "../NavigateToAddressButton";
import { VisitDistanceLabel } from "../VisitDistanceLabel";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";

interface NotFoundStatusProps {
  address?: ClientAddress;
  destinationCoordinates?: { latitude: number; longitude: number };
  distanceMeters?: number;
  radiusMeters?: number;
  /** AUREA-352: distância provavelmente não confiável — endereço cadastrado pode estar errado. */
  addressLikelyWrong?: boolean;
  onConfirmManual: () => void;
}

export function NotFoundStatus({
  address,
  destinationCoordinates,
  distanceMeters,
  radiusMeters,
  addressLikelyWrong = false,
  onConfirmManual,
}: NotFoundStatusProps) {
  const hasDistance = distanceMeters !== undefined;
  let title = "Você não está no endereço";
  let description =
    "Para registrar a visita, vá ao endereço ou confirme presença manualmente.";
  if (!hasDistance) {
    title = "Não foi possível obter sua localização";
    description =
      "Vá ao endereço ou confirme presença manualmente para continuar.";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive-bg p-4">
        <MapPinOff size={18} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <VisitDistanceLabel
              distanceMeters={distanceMeters}
              radiusMeters={radiusMeters}
              variant="not_found"
              centered={false}
            />
            {description}
          </p>
        </div>
      </div>
      {hasDistance && addressLikelyWrong && <AddressMismatchAlert />}
      <NavigateToAddressButton
        address={address}
        destinationCoordinates={destinationCoordinates}
      />
      <ManualVisitConfirm onConfirmManual={onConfirmManual} />
    </div>
  );
}

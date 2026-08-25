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
  // AUREA-352: quando o geocoding não é confiável, a distância calculada
  // pode estar errada por vários km (caso real: parceiro confirmadamente no
  // endereço certo, sistema acusou ~35km). Mostrar esse número, mesmo ao
  // lado de um aviso, ainda passa a mensagem falsa de "você está longe" —
  // por isso aqui nem o título nem a distância assumem que o parceiro está
  // no lugar errado; só dizemos que não foi possível confirmar.
  const unreliableDistance = hasDistance && addressLikelyWrong;

  let title = "Você não está no endereço";
  let description =
    "Para registrar a visita, vá ao endereço ou confirme presença manualmente.";
  if (!hasDistance) {
    title = "Não foi possível obter sua localização";
    description =
      "Vá ao endereço ou confirme presença manualmente para continuar.";
  } else if (unreliableDistance) {
    title = "Não foi possível confirmar sua localização";
    description =
      "Verifique se o endereço cadastrado está correto ou confirme presença manualmente.";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive-bg p-4">
        <MapPinOff size={18} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {!unreliableDistance && (
              <VisitDistanceLabel
                distanceMeters={distanceMeters}
                radiusMeters={radiusMeters}
                variant="not_found"
                centered={false}
              />
            )}
            {description}
          </p>
        </div>
      </div>
      {unreliableDistance && <AddressMismatchAlert />}
      <NavigateToAddressButton
        address={address}
        destinationCoordinates={destinationCoordinates}
      />
      <ManualVisitConfirm onConfirmManual={onConfirmManual} />
    </div>
  );
}

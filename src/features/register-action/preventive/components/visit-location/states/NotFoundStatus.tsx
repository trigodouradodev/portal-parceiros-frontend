import { MapPinOff } from "lucide-react";
import type {
  GeoFailureReason,
  GeoPermissionState,
} from "@/lib/geo/geo-position-error";
import {
  detectMobileBrowserOs,
  geoFailureDescription,
  geoFailureTitle,
  locationPermissionIntro,
  locationPermissionSteps,
  permissionStillPromptable,
  type MobileBrowserOs,
} from "@/lib/geo/geo-position-error";
import type { ManualLocationReason } from "@/features/register-action/preventive/constants/manual-location-reason";
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
  /** Endereço que o geocoding devolveu, para o parceiro conferir o pin. */
  matchedAddress?: string;
  /** Falha do GPS/dispositivo antes da checagem de raio. */
  geoFailureReason?: GeoFailureReason | null;
  /** `prompt` ainda reabre a caixinha; `denied`/`unknown` não. */
  geoPermissionState?: GeoPermissionState | null;
  onConfirmManual: (reason: ManualLocationReason) => void;
  onRetry?: () => void;
}

interface NotFoundView {
  title: string;
  description: string;
  unreliableDistance: boolean;
  deviceFailure: boolean;
  permissionBlocked: boolean;
  manualFirst: boolean;
  browserOs: MobileBrowserOs;
}

function resolveNotFoundView(input: {
  distanceMeters?: number;
  addressLikelyWrong: boolean;
  geoFailureReason: GeoFailureReason | null;
  geoPermissionState: GeoPermissionState | null;
}): NotFoundView {
  const hasDistance = input.distanceMeters !== undefined;
  // AUREA-352: quando o geocoding não é confiável, a distância calculada
  // pode estar errada por vários km (caso real: parceiro confirmadamente no
  // endereço certo, sistema acusou ~35km). Mostrar esse número, mesmo ao
  // lado de um aviso, ainda passa a mensagem falsa de "você está longe" —
  // por isso aqui nem o título nem a distância assumem que o parceiro está
  // no lugar errado; só dizemos que não foi possível confirmar.
  const unreliableDistance = hasDistance && input.addressLikelyWrong;
  const deviceFailure = Boolean(input.geoFailureReason) && !hasDistance;
  const permissionDenied = input.geoFailureReason === "permission_denied";
  const permissionBlocked =
    deviceFailure &&
    permissionDenied &&
    !permissionStillPromptable(input.geoPermissionState);
  const browserOs = detectMobileBrowserOs();
  const manualFirst = unreliableDistance;

  let title = "Você não está no endereço";
  let description =
    "Para registrar a visita, vá ao endereço ou confirme presença manualmente.";
  if (deviceFailure && input.geoFailureReason) {
    title = geoFailureTitle(input.geoFailureReason);
    if (permissionBlocked) {
      description = locationPermissionIntro(browserOs);
    } else if (
      permissionDenied &&
      permissionStillPromptable(input.geoPermissionState)
    ) {
      description =
        "O navegador ainda pode pedir a localização. Toque em Tentar novamente para autorizar.";
    } else {
      description = geoFailureDescription(input.geoFailureReason);
    }
  } else if (!hasDistance) {
    title = "Não foi possível obter sua localização";
    description =
      "Vá ao endereço ou confirme presença manualmente para continuar.";
  } else if (unreliableDistance) {
    title = "Não foi possível confirmar sua localização";
    description =
      "O endereço foi localizado só de forma aproximada. Se você está no local, confirme a presença.";
  }

  return {
    title,
    description,
    unreliableDistance,
    deviceFailure,
    permissionBlocked,
    manualFirst,
    browserOs,
  };
}

export function NotFoundStatus({
  address,
  destinationCoordinates,
  distanceMeters,
  radiusMeters,
  addressLikelyWrong = false,
  matchedAddress,
  geoFailureReason = null,
  geoPermissionState = null,
  onConfirmManual,
  onRetry,
}: NotFoundStatusProps) {
  const view = resolveNotFoundView({
    distanceMeters,
    addressLikelyWrong,
    geoFailureReason,
    geoPermissionState,
  });

  if (view.permissionBlocked) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-base font-semibold text-foreground">
            Libere a localização
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {view.description}
          </p>
          <ol className="mt-4 flex flex-col gap-3">
            {locationPermissionSteps(view.browserOs).map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-sm text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex w-full items-center justify-center rounded-2xl bg-brand-navy py-3.5 text-sm font-semibold text-white transition-colors outline-none hover:bg-brand-navy/90 focus-visible:ring-2 focus-visible:ring-brand-navy/40"
          >
            Tentar novamente
          </button>
        )}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">
            Se não conseguir, confirme a visita mesmo assim
          </p>
          <ManualVisitConfirm
            emphasis="secondary"
            showHint={false}
            legend="Escolha o motivo"
            onConfirmManual={onConfirmManual}
          />
        </div>
        <NavigateToAddressButton
          address={address}
          destinationCoordinates={destinationCoordinates}
          variant="secondary"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive-bg p-4">
        <MapPinOff size={18} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">{view.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {!view.unreliableDistance && !view.deviceFailure && (
              <VisitDistanceLabel
                distanceMeters={distanceMeters}
                radiusMeters={radiusMeters}
                variant="not_found"
                centered={false}
              />
            )}
            {view.description}
          </p>
          {view.unreliableDistance && matchedAddress && (
            <p className="mt-2 text-xs text-muted-foreground">
              Endereço usado: {matchedAddress}
            </p>
          )}
        </div>
      </div>
      {view.deviceFailure && !view.manualFirst && onRetry && (
        <RetryLocationButton onRetry={onRetry} />
      )}
      {view.manualFirst ? (
        <>
          <ManualVisitConfirm
            emphasis="primary"
            showHint={false}
            onConfirmManual={onConfirmManual}
          />
          <NavigateToAddressButton
            address={address}
            destinationCoordinates={destinationCoordinates}
            variant="secondary"
          />
        </>
      ) : (
        <>
          <NavigateToAddressButton
            address={address}
            destinationCoordinates={destinationCoordinates}
          />
          <ManualVisitConfirm onConfirmManual={onConfirmManual} />
        </>
      )}
    </div>
  );
}

function RetryLocationButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="flex w-full items-center justify-center rounded-2xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
    >
      Tentar novamente
    </button>
  );
}

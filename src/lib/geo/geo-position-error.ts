export type GeoFailureReason =
  | "unsupported"
  | "permission_denied"
  | "position_unavailable"
  | "timeout";

export type MobileBrowserOs = "ios" | "android" | "other";

/** `unknown` quando o navegador não expõe a Permissions API (Safari antigo). */
export type GeoPermissionState = PermissionState | "unknown";

/** Accuracy acima disso dispara aviso de sinal fraco (metros). */
export const WEAK_GPS_ACCURACY_METERS = 50;

export function mapGeoPositionError(
  error: GeolocationPositionError,
): GeoFailureReason {
  if (error.code === error.PERMISSION_DENIED) return "permission_denied";
  if (error.code === error.TIMEOUT) return "timeout";
  return "position_unavailable";
}

export function geoFailureTitle(reason: GeoFailureReason): string {
  switch (reason) {
    case "permission_denied":
      return "Sem permissão de localização";
    case "timeout":
      return "Tempo esgotado ao localizar";
    case "unsupported":
      return "Geolocalização indisponível";
    case "position_unavailable":
      return "Não foi possível obter sua localização";
  }
}

export function detectMobileBrowserOs(
  userAgent: string = navigator.userAgent,
): MobileBrowserOs {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

/**
 * "Nunca permitir" deixa o estado em `denied` e o navegador não mostra mais
 * o pedido. Sem Permissions API, tratamos como bloqueado: o botão de tentar
 * de novo não reabre a caixinha.
 */
export async function readGeoPermissionState(): Promise<GeoPermissionState> {
  if (!navigator.permissions?.query) return "unknown";
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "unknown";
  }
}

export function permissionStillPromptable(
  state: GeoPermissionState | null,
): boolean {
  return state === "prompt";
}

/**
 * Segunda tentativa com o site ainda bloqueado. `getCurrentPosition` não
 * reabre a caixinha e a tela ficaria igual.
 */
export function retryStillBlocked(
  failure: GeoFailureReason | null,
  previous: GeoPermissionState | null,
  latest: GeoPermissionState,
): boolean {
  const wasBlocked =
    failure === "permission_denied" && !permissionStillPromptable(previous);
  return wasBlocked && (latest === "denied" || latest === "unknown");
}

/** Passos na ordem em que a pessoa vê na tela do celular ou do computador. */
export function locationPermissionSteps(os: MobileBrowserOs): string[] {
  switch (os) {
    case "ios":
      return [
        "Toque no AA ao lado do endereço, em cima da tela.",
        "Toque em Ajustes do site.",
        "Em Localização, escolha Permitir.",
      ];
    case "android":
      return [
        "Em cima da tela, toque no cadeado ao lado do endereço.",
        "Toque em Permissões.",
        "Em Localização, escolha Permitir.",
      ];
    case "other":
      return [
        "Clique no cadeado ao lado do endereço, em cima da página.",
        "Clique em Permissões do site.",
        "Em Localização, escolha Permitir.",
      ];
  }
}

export function locationPermissionIntro(os: MobileBrowserOs): string {
  const device = os === "other" ? "computador" : "celular";
  return `O ${device} não vai mais perguntar onde você está. Faça assim:`;
}

function permissionDeniedDescription(os: MobileBrowserOs): string {
  return `${locationPermissionIntro(os)} ${locationPermissionSteps(os).join(" ")}`;
}

export function geoFailureDescription(
  reason: GeoFailureReason,
  os: MobileBrowserOs = detectMobileBrowserOs(),
): string {
  switch (reason) {
    case "permission_denied":
      return permissionDeniedDescription(os);
    case "timeout":
      return "O GPS demorou para responder. Aproxime-se de uma área aberta e tente novamente.";
    case "unsupported":
      return "Este dispositivo ou navegador não oferece geolocalização.";
    case "position_unavailable":
      return "Ative o GPS do celular e tente novamente. Se já estiver ligado, aproxime-se de uma janela ou área aberta.";
  }
}

export function geoPositionErrorMessage(
  error: GeolocationPositionError,
): string {
  return geoFailureDescription(mapGeoPositionError(error));
}

export type GeoFailureReason =
  | "unsupported"
  | "permission_denied"
  | "position_unavailable"
  | "timeout";

/**
 * O Chrome no iOS é um caso à parte: não tem tela de permissão por site, então
 * os passos que ele recebe são outros.
 */
export type MobileBrowserOs = "ios" | "ios_chrome" | "android" | "desktop";

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

/** Plataformas em que a barra de endereço é a de um navegador de computador. */
const DESKTOP_PLATFORM = /Windows NT|Macintosh|CrOS|X11|Linux x86_64/i;

/**
 * Sem sinal claro de computador assumimos celular, que é de onde vem quase
 * todo o acesso dos parceiros: errar para o lado do desktop deixa a pessoa
 * procurando um cadeado que não existe na tela dela.
 *
 * O iPadOS 13+ se anuncia como Macintosh, então só o toque separa os dois.
 * Dentro do iOS ainda separamos o Chrome (`CriOS`), porque as telas que ele
 * oferece são diferentes das do Safari.
 */
export function detectMobileBrowserOs(
  userAgent: string = navigator.userAgent,
  touchPoints: number = navigator.maxTouchPoints ?? 0,
): MobileBrowserOs {
  const isIos =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && touchPoints > 0);
  if (isIos) return /CriOS/i.test(userAgent) ? "ios_chrome" : "ios";
  if (/Android/i.test(userAgent)) return "android";
  return DESKTOP_PLATFORM.test(userAgent) ? "desktop" : "android";
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
    // O botão mudou de lugar no iOS 26 e a barra de endereço fica embaixo
    // desde o iOS 15, então não afirmamos onde ele está na tela.
    case "ios":
      return [
        "Ao lado do endereço, toque nos três pontinhos (ou no AA, em iPhones mais antigos).",
        "Se abrir outra linha de opções, toque nos três pontinhos de novo.",
        "Role até Ajustes do Site e, em Localização, escolha Permitir.",
      ];
    // O Chrome no iPhone não tem permissão por site: depois de bloquear, nem
    // limpar os dados do site reabre a caixinha de forma confiável. Só resta
    // o ajuste do app inteiro e, se não bastar, trocar de navegador.
    case "ios_chrome":
      return [
        "Abra os Ajustes do iPhone e toque em Privacidade e Segurança.",
        "Em Serviços de Localização, toque em Chrome e escolha Ao Usar o App.",
        "Volte ao Chrome e recarregue a página.",
        "Se continuar bloqueado, abra o mesmo link no Safari.",
      ];
    case "android":
      return [
        "Em cima da tela, toque no cadeado ao lado do endereço.",
        "Toque em Permissões.",
        "Em Localização, escolha Permitir.",
      ];
    case "desktop":
      return [
        "Clique no cadeado ao lado do endereço, em cima da página.",
        "Clique em Permissões do site.",
        "Em Localização, escolha Permitir.",
      ];
  }
}

export function locationPermissionIntro(): string {
  return "O sistema não vai mais perguntar onde você está. Siga os passos:";
}

function permissionDeniedDescription(os: MobileBrowserOs): string {
  return `${locationPermissionIntro()} ${locationPermissionSteps(os).join(" ")}`;
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

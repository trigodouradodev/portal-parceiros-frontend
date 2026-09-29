export type GeoFailureReason =
  | "unsupported"
  | "permission_denied"
  | "position_unavailable"
  | "timeout";

/** Sistema do aparelho: define onde fica o ajuste de localização do sistema. */
export type DeviceOs = "ios" | "android" | "mac" | "windows" | "desktop";

/**
 * Navegador: define onde fica a permissão do site. Edge segue os passos do
 * Chrome (mesma base), e o resto cai em `other` com passos genéricos.
 */
export type BrowserKind = "safari" | "chrome" | "edge" | "other";

export interface BrowserPlatform {
  os: DeviceOs;
  browser: BrowserKind;
}

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

/**
 * Navegadores do Android que não são o Chrome, inclusive o navegador embutido
 * de apps (`; wv)`), onde não há barra de endereço para mexer.
 */
const ANDROID_NON_CHROME =
  /SamsungBrowser|Firefox|EdgA|OPR|MiuiBrowser|YaBrowser|UCBrowser|; wv\)/i;

/** No iOS todo navegador usa o motor do Safari, mas só o Safari tem ajuste por site. */
const IOS_NON_SAFARI = /FxiOS|EdgiOS|OPiOS|YaBrowser/i;

/**
 * Sem sinal claro de computador assumimos celular, que é de onde vem quase
 * todo o acesso dos parceiros: errar para o lado do desktop deixa a pessoa
 * procurando um cadeado que não existe na tela dela.
 *
 * O iPadOS 13+ se anuncia como Macintosh, então só o toque separa os dois.
 */
export function detectBrowserPlatform(
  userAgent: string = navigator.userAgent,
  touchPoints: number = navigator.maxTouchPoints ?? 0,
): BrowserPlatform {
  const isIos =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && touchPoints > 0);
  if (isIos) {
    if (/CriOS/i.test(userAgent)) return { os: "ios", browser: "chrome" };
    if (IOS_NON_SAFARI.test(userAgent)) return { os: "ios", browser: "other" };
    return { os: "ios", browser: "safari" };
  }
  if (/Android/i.test(userAgent)) {
    const browser = ANDROID_NON_CHROME.test(userAgent) ? "other" : "chrome";
    return { os: "android", browser };
  }

  let os: DeviceOs;
  if (/Macintosh/i.test(userAgent)) os = "mac";
  else if (/Windows NT/i.test(userAgent)) os = "windows";
  else if (/CrOS|X11|Linux x86_64/i.test(userAgent)) os = "desktop";
  else return { os: "android", browser: "chrome" };

  return { os, browser: detectDesktopBrowser(userAgent) };
}

function detectDesktopBrowser(userAgent: string): BrowserKind {
  if (/Edg\//i.test(userAgent)) return "edge";
  if (/Firefox|OPR\//i.test(userAgent)) return "other";
  if (/Chrome|Chromium/i.test(userAgent)) return "chrome";
  if (/Safari/i.test(userAgent)) return "safari";
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

const BROWSER_NAME: Record<BrowserKind, string> = {
  safari: "Safari",
  chrome: "Chrome",
  edge: "Edge",
  other: "navegador",
};

const DEVICE_NAME: Record<DeviceOs, string> = {
  ios: "iPhone",
  android: "Android",
  mac: "Mac",
  windows: "Windows",
  desktop: "computador",
};

/** Mostrado acima dos passos para a pessoa saber de qual tela estamos falando. */
export function browserPlatformLabel({ os, browser }: BrowserPlatform): string {
  if (browser === "other") return `Seu navegador no ${DEVICE_NAME[os]}`;
  return `${BROWSER_NAME[browser]} no ${DEVICE_NAME[os]}`;
}

/**
 * Passos na ordem em que a pessoa vê na tela: primeiro a permissão do site no
 * navegador e, por último, o ajuste do sistema. Se o sistema proíbe o
 * navegador de usar a localização, liberar o site não resolve — e o erro que
 * chega para nós é o mesmo, então sempre mostramos os dois.
 */
export function locationPermissionSteps(platform: BrowserPlatform): string[] {
  const system = systemLocationStep(platform);
  return system
    ? [...siteLocationSteps(platform), system]
    : siteLocationSteps(platform);
}

function siteLocationSteps({ os, browser }: BrowserPlatform): string[] {
  switch (os) {
    case "ios":
      // O botão mudou de lugar no iOS 26 e a barra de endereço fica embaixo
      // desde o iOS 15, então não afirmamos onde ele está na tela.
      if (browser === "safari")
        return [
          "Ao lado do endereço, toque nos três pontinhos (ou no AA, em iPhones mais antigos).",
          "Se abrir outra linha de opções, toque nos três pontinhos de novo.",
          "Role até Ajustes do Site e, em Localização, escolha Permitir.",
        ];
      // Fora do Safari não há permissão por site: depois de bloquear, nem
      // limpar os dados do site reabre a caixinha de forma confiável. Só resta
      // o ajuste do app inteiro e, se não bastar, trocar de navegador.
      return [
        "Abra o app Ajustes do iPhone e toque em Privacidade e Segurança.",
        `Toque em Serviços de Localização, depois em ${iosAppName(browser)}, e escolha Ao Usar o App. Deixe Localização Precisa ligada.`,
        `Volte ao ${BROWSER_NAME[browser]} e recarregue a página.`,
        "Se continuar bloqueado, abra o mesmo link no Safari.",
      ];
    case "android":
      // O Chrome trocou o cadeado por um ícone de ajustes na versão 117 e
      // chama a permissão de "Local" em português.
      if (browser === "chrome")
        return [
          "Em cima da tela, toque no ícone à esquerda do endereço (cadeado ou dois tracinhos).",
          "Toque em Permissões.",
          "Ligue Local ou escolha Permitir.",
        ];
      return [
        "Toque no cadeado ou no ícone ao lado do endereço.",
        "Procure Permissões do site e, em Localização, escolha Permitir.",
        "Se não encontrar, abra o mesmo link no Chrome.",
      ];
    case "mac":
    case "windows":
    case "desktop":
      if (browser === "safari")
        return [
          "No menu Safari, no alto da tela, clique em Ajustes (ou Preferências).",
          "Abra a aba Sites e clique em Localização, na lista à esquerda.",
          "Ao lado deste site, escolha Permitir.",
        ];
      if (browser === "other")
        return [
          "Clique no ícone à esquerda do endereço, em cima da página.",
          "Em Localização, tire o bloqueio ou escolha Permitir.",
        ];
      return [
        "Clique no ícone à esquerda do endereço, em cima da página.",
        `Ligue ${browser === "edge" ? "Localização" : "Local"}. Se não aparecer, clique em Configurações do site e escolha Permitir.`,
      ];
  }
}

function systemLocationStep({ os, browser }: BrowserPlatform): string | null {
  switch (os) {
    case "ios":
      return browser === "safari"
        ? "Se continuar bloqueado, abra Ajustes > Privacidade e Segurança > Serviços de Localização > Sites do Safari e escolha Ao Usar o App, com Localização Precisa ligada."
        : null;
    case "android":
      return `Se continuar bloqueado, abra as Configurações do celular > Apps > ${browser === "chrome" ? "Chrome" : "seu navegador"} > Permissões > Local e escolha Permitir durante o uso do app, com Usar local preciso ligado.`;
    case "mac":
      return `Se continuar bloqueado, abra Ajustes do Sistema > Privacidade e Segurança > Serviços de Localização e ligue o ${macAppName(browser)}.`;
    case "windows":
      return "Se continuar bloqueado, abra Configurações do Windows > Privacidade e segurança > Localização e ligue os Serviços de localização e o acesso dos aplicativos da área de trabalho.";
    case "desktop":
      return null;
  }
}

function iosAppName(browser: BrowserKind): string {
  return browser === "other"
    ? "o navegador que você usa"
    : BROWSER_NAME[browser];
}

function macAppName(browser: BrowserKind): string {
  if (browser === "chrome") return "Google Chrome";
  if (browser === "edge") return "Microsoft Edge";
  return browser === "safari" ? "Safari" : "navegador que você usa";
}

export function locationPermissionIntro(): string {
  return "O sistema não vai mais perguntar onde você está. Siga os passos:";
}

function permissionDeniedDescription(platform: BrowserPlatform): string {
  return `${locationPermissionIntro()} ${locationPermissionSteps(platform).join(" ")}`;
}

export function geoFailureDescription(
  reason: GeoFailureReason,
  platform: BrowserPlatform = detectBrowserPlatform(),
): string {
  switch (reason) {
    case "permission_denied":
      return permissionDeniedDescription(platform);
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

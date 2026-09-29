import { describe, expect, it } from "vitest";
import {
  browserPlatformLabel,
  detectBrowserPlatform,
  geoFailureDescription,
  locationPermissionSteps,
  mapGeoPositionError,
  readGeoPermissionState,
  retryStillBlocked,
} from "./geo-position-error";

const UA = {
  iosSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  iosChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1",
  iosFirefox:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.0 Mobile/15E148 Safari/605.1.15",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
  androidSamsung:
    "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0 Mobile Safari/537.36",
  androidWebview:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0 Mobile Safari/537.36",
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  macChrome:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  windowsChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  windowsEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0",
  windowsFirefox:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
};

describe("detectBrowserPlatform", () => {
  it.each([
    [UA.iosSafari, { os: "ios", browser: "safari" }],
    [UA.iosChrome, { os: "ios", browser: "chrome" }],
    [UA.iosFirefox, { os: "ios", browser: "other" }],
    [UA.androidChrome, { os: "android", browser: "chrome" }],
    [UA.androidSamsung, { os: "android", browser: "other" }],
    [UA.androidWebview, { os: "android", browser: "other" }],
    [UA.macSafari, { os: "mac", browser: "safari" }],
    [UA.macChrome, { os: "mac", browser: "chrome" }],
    [UA.windowsChrome, { os: "windows", browser: "chrome" }],
    [UA.windowsEdge, { os: "windows", browser: "edge" }],
    [UA.windowsFirefox, { os: "windows", browser: "other" }],
  ])("detecta %s", (userAgent, expected) => {
    expect(detectBrowserPlatform(userAgent, 0)).toEqual(expected);
  });

  it("trata o iPad como iOS mesmo se anunciando como Macintosh", () => {
    expect(detectBrowserPlatform(UA.macSafari, 5)).toEqual({
      os: "ios",
      browser: "safari",
    });
  });

  it("assume celular quando o userAgent não parece de computador", () => {
    // Webview de app e navegador de fabricante caem aqui: passar instruções
    // de desktop mandaria o parceiro procurar um cadeado inexistente.
    expect(detectBrowserPlatform("Mozilla/5.0 (Unknown device)", 1)).toEqual({
      os: "android",
      browser: "chrome",
    });
  });
});

describe("locationPermissionSteps", () => {
  it("guia o Safari do iPhone até Ajustes do Site e depois Sites do Safari", () => {
    const steps = locationPermissionSteps({ os: "ios", browser: "safari" });
    expect(steps.join(" ")).toMatch(/três pontinhos/);
    expect(steps.join(" ")).toMatch(/Ajustes do Site/);
    expect(steps.at(-1)).toMatch(/Sites do Safari/);
  });

  // O Chrome no iPhone não tem permissão por site, então mandar o parceiro
  // procurar "Ajustes do Site" ali seria uma instrução impossível de seguir.
  it("manda o Chrome do iPhone para os Ajustes do sistema, não para o site", () => {
    const steps = locationPermissionSteps({ os: "ios", browser: "chrome" });
    expect(steps.join(" ")).toMatch(
      /Serviços de Localização, depois em Chrome/,
    );
    expect(steps.at(-1)).toMatch(/Safari/);
    expect(steps.join(" ")).not.toMatch(/Ajustes do Site/);
  });

  it("guia o Chrome do Android pela permissão Local e depois pelo app", () => {
    const steps = locationPermissionSteps({ os: "android", browser: "chrome" });
    expect(steps.join(" ")).toMatch(/Permissões/);
    expect(steps.join(" ")).toMatch(/Ligue Local/);
    expect(steps.at(-1)).toMatch(/Apps > Chrome > Permissões/);
  });

  it("sugere o Chrome para outros navegadores do Android", () => {
    const steps = locationPermissionSteps({ os: "android", browser: "other" });
    expect(steps.join(" ")).toMatch(/abra o mesmo link no Chrome/);
  });

  it("guia o Safari do Mac pelos Ajustes do Safari e do sistema", () => {
    const steps = locationPermissionSteps({ os: "mac", browser: "safari" });
    expect(steps.join(" ")).toMatch(/aba Sites/);
    expect(steps.at(-1)).toMatch(/Ajustes do Sistema.*ligue o Safari/);
  });

  it("guia o Chrome do computador e o ajuste do sistema de cada um", () => {
    const mac = locationPermissionSteps({ os: "mac", browser: "chrome" });
    expect(mac.join(" ")).toMatch(/Ligue Local/);
    expect(mac.at(-1)).toMatch(/ligue o Google Chrome/);

    const windows = locationPermissionSteps({
      os: "windows",
      browser: "chrome",
    });
    expect(windows.at(-1)).toMatch(/Configurações do Windows/);
  });

  it("não inventa ajuste de sistema onde não existe", () => {
    const steps = locationPermissionSteps({ os: "desktop", browser: "chrome" });
    expect(steps.join(" ")).not.toMatch(/Se continuar bloqueado/);
  });
});

describe("browserPlatformLabel", () => {
  it("nomeia o navegador e o aparelho", () => {
    expect(browserPlatformLabel({ os: "ios", browser: "safari" })).toBe(
      "Safari no iPhone",
    );
    expect(browserPlatformLabel({ os: "android", browser: "other" })).toBe(
      "Seu navegador no Android",
    );
  });
});

describe("geoFailureDescription", () => {
  it("inclui os passos do navegador quando a permissão foi negada", () => {
    expect(
      geoFailureDescription("permission_denied", {
        os: "ios",
        browser: "safari",
      }),
    ).toMatch(/Ajustes do Site/);
  });
});

describe("retryStillBlocked", () => {
  it("não chama o GPS de novo quando a permissão segue bloqueada", () => {
    expect(retryStillBlocked("permission_denied", "denied", "denied")).toBe(
      true,
    );
    expect(retryStillBlocked("permission_denied", "unknown", "unknown")).toBe(
      true,
    );
  });

  it("libera nova tentativa quando o navegador volta a pedir ou a permissão foi concedida", () => {
    expect(retryStillBlocked("permission_denied", "denied", "prompt")).toBe(
      false,
    );
    expect(retryStillBlocked("permission_denied", "denied", "granted")).toBe(
      false,
    );
    expect(retryStillBlocked("permission_denied", "prompt", "denied")).toBe(
      false,
    );
  });
});

describe("readGeoPermissionState", () => {
  it("devolve unknown quando a Permissions API não existe", async () => {
    vi.stubGlobal("navigator", { userAgent: "test" });
    await expect(readGeoPermissionState()).resolves.toBe("unknown");
    vi.unstubAllGlobals();
  });
});

describe("mapGeoPositionError", () => {
  it("mapeia códigos do GeolocationPositionError", () => {
    expect(
      mapGeoPositionError({
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "",
      } as GeolocationPositionError),
    ).toBe("permission_denied");
    expect(
      mapGeoPositionError({
        code: 3,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "",
      } as GeolocationPositionError),
    ).toBe("timeout");
  });
});

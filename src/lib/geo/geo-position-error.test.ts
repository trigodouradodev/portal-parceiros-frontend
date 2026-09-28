import { describe, expect, it } from "vitest";
import {
  detectMobileBrowserOs,
  geoFailureDescription,
  mapGeoPositionError,
  readGeoPermissionState,
  retryStillBlocked,
} from "./geo-position-error";

describe("detectMobileBrowserOs", () => {
  it("detecta iOS e Android pelo userAgent", () => {
    expect(
      detectMobileBrowserOs("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"),
    ).toBe("ios");
    expect(
      detectMobileBrowserOs(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) CriOS/140.0",
      ),
    ).toBe("ios_chrome");
    expect(
      detectMobileBrowserOs("Mozilla/5.0 (Linux; Android 14; Pixel 8)"),
    ).toBe("android");
    expect(detectMobileBrowserOs("Mozilla/5.0 (Macintosh)", 0)).toBe("desktop");
  });

  it("trata o iPad como iOS mesmo se anunciando como Macintosh", () => {
    expect(
      detectMobileBrowserOs(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        5,
      ),
    ).toBe("ios");
  });

  it("assume celular quando o userAgent não parece de computador", () => {
    // Webview de app e navegador de fabricante caem aqui: passar instruções
    // de desktop mandaria o parceiro procurar um cadeado inexistente.
    expect(detectMobileBrowserOs("Mozilla/5.0 (Unknown device)", 1)).toBe(
      "android",
    );
  });
});

describe("geoFailureDescription", () => {
  it("guia o Safari do iPhone até Ajustes do Site", () => {
    expect(geoFailureDescription("permission_denied", "ios")).toMatch(
      /três pontinhos/,
    );
    expect(geoFailureDescription("permission_denied", "ios")).toMatch(
      /Ajustes do Site/,
    );
  });

  // O Chrome no iPhone não tem permissão por site, então mandar o parceiro
  // procurar "Ajustes do Site" ali seria uma instrução impossível de seguir.
  it("manda o Chrome do iPhone para os Ajustes do sistema, não para o site", () => {
    const description = geoFailureDescription(
      "permission_denied",
      "ios_chrome",
    );
    expect(description).toMatch(/Serviços de Localização/);
    expect(description).toMatch(/Safari/);
    expect(description).not.toMatch(/Ajustes do Site/);
  });

  it("guia o Android a tocar no cadeado e em Permissões", () => {
    expect(geoFailureDescription("permission_denied", "android")).toMatch(
      /Permissões/,
    );
    expect(geoFailureDescription("permission_denied", "android")).toMatch(
      /escolha Permitir/,
    );
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

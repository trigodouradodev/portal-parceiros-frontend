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
      detectMobileBrowserOs("Mozilla/5.0 (Linux; Android 14; Pixel 8)"),
    ).toBe("android");
    expect(detectMobileBrowserOs("Mozilla/5.0 (Macintosh)")).toBe("other");
  });
});

describe("geoFailureDescription", () => {
  it("guia o iPhone a tocar em AA e permitir localização", () => {
    expect(geoFailureDescription("permission_denied", "ios")).toMatch(/AA/);
    expect(geoFailureDescription("permission_denied", "ios")).toMatch(
      /Ajustes do site/,
    );
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

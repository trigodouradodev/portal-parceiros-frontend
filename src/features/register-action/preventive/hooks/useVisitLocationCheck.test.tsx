import { act, renderHook, waitFor } from "@testing-library/react";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";
import { useVisitLocationCheck } from "./useVisitLocationCheck";

const { mutateAsync, showToast } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/hooks/useVerifyLocation", () => ({
  useVerifyLocation: () => ({ mutateAsync }),
}));

vi.mock("@/contexts/toast/toast-context", () => ({
  useToast: () => ({ showToast }),
}));

const outsideRadiusResult: LocationCheckResult = {
  withinRadius: false,
  distanceMeters: 400,
  radiusMeters: 100,
  effectiveRadiusMeters: 100,
  proximityRadiusMeters: 300,
  confirmationLevel: null,
  registeredCoordinates: { latitude: -23.5, longitude: -46.6 },
  providedCoordinates: { latitude: -23.504, longitude: -46.6 },
  matchedAddress: "Rua X",
  locationType: "ROOFTOP",
  partialMatch: false,
  addressLikelyWrong: false,
};

function position(latitude: number, longitude: number): GeolocationPosition {
  return {
    coords: {
      latitude,
      longitude,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: Date.now(),
    toJSON: () => ({}),
  };
}

const positionUnavailable = {
  code: 2,
  message: "Position unavailable",
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as GeolocationPositionError;

describe("useVisitLocationCheck", () => {
  const successes: PositionCallback[] = [];
  const failures: PositionErrorCallback[] = [];
  const getCurrentPosition = vi.fn(
    (success: PositionCallback, failure: PositionErrorCallback | null) => {
      successes.push(success);
      if (failure) failures.push(failure);
    },
  );

  beforeEach(() => {
    successes.length = 0;
    failures.length = 0;
    mutateAsync.mockReset();
    showToast.mockReset();
    getCurrentPosition.mockClear();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });
  });

  it("descarta coordenadas anteriores ao tentar localizar novamente", async () => {
    mutateAsync.mockResolvedValue(outsideRadiusResult);
    const { result } = renderHook(() =>
      useVisitLocationCheck({
        contractId: "6cf6fc2f-b637-46b9-9f76-833e871dd0eb",
        installmentNumber: 1,
      }),
    );

    act(() => result.current.verify());
    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(1));

    await act(async () => successes[0](position(-23.504, -46.6)));
    await waitFor(() => expect(result.current.status).toBe("not_found"));
    expect(result.current.coords).toEqual({
      latitude: -23.504,
      longitude: -46.6,
    });

    act(() => result.current.verify());
    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(2));
    expect(result.current.coords).toBeNull();

    act(() => failures[1](positionUnavailable));
    await waitFor(() => expect(result.current.status).toBe("not_found"));
    expect(result.current.coords).toBeNull();
  });
});

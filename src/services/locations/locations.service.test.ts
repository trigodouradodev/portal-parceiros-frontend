import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REVERSE_GEOCODE_TIMEOUT_MS,
  locationsService,
} from "@/services/locations/locations.service";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/api/axios", () => ({
  api: { get },
  default: { get },
}));

const REVERSE_OK = {
  zipCode: "01001000",
  streetName: "Praça da Sé",
  streetNumber: "100",
  streetComplement: null,
  streetDistrict: "Sé",
  city: "São Paulo",
  state: "SP",
  formattedAddress: "Praça da Sé, 100",
  latitude: -23.55052,
  longitude: -46.633308,
  locationType: "ROOFTOP",
};

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: REVERSE_OK });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("locationsService.reverseGeocode", () => {
  it("GETs /locations/reverse-geocode with latitude and longitude", async () => {
    await expect(
      locationsService.reverseGeocode(-23.55052, -46.633308),
    ).resolves.toEqual(REVERSE_OK);

    expect(get).toHaveBeenCalledWith(
      "/locations/reverse-geocode",
      expect.objectContaining({
        params: { latitude: -23.55052, longitude: -46.633308 },
        timeout: REVERSE_GEOCODE_TIMEOUT_MS,
      }),
    );
  });

  it("propagates HTTP errors", async () => {
    get.mockRejectedValue(
      new AxiosError("error", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 422,
        data: {
          message:
            "As coordenadas informadas não pertencem a um endereço no Brasil.",
        },
        statusText: "Unprocessable Entity",
        headers: {},
        config: { headers: {} as never },
      }),
    );

    await expect(locationsService.reverseGeocode(0, 0)).rejects.toBeInstanceOf(
      AxiosError,
    );
  });
});

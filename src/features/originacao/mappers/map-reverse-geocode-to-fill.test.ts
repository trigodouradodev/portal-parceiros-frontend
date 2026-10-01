import { describe, expect, it } from "vitest";
import {
  formatGeoPrecision,
  mapReverseGeocodeToFill,
} from "@/features/originacao/mappers/map-reverse-geocode-to-fill";
import type { ReverseGeocodedAddress } from "@/services/locations/locations.types";

const sample: ReverseGeocodedAddress = {
  zipCode: "01001000",
  streetName: "Praça da Sé",
  streetNumber: "100",
  streetComplement: "Bloco A",
  streetDistrict: "Sé",
  city: "São Paulo",
  state: "sp",
  formattedAddress: "Praça da Sé, 100 - Sé, São Paulo - SP",
  latitude: -23.55052,
  longitude: -46.633308,
  locationType: "ROOFTOP",
};

describe("formatGeoPrecision", () => {
  it("rounds meters for the PATCH precision field", () => {
    expect(formatGeoPrecision(14.6)).toBe("15m");
    expect(formatGeoPrecision(0)).toBe("unknown");
  });
});

describe("mapReverseGeocodeToFill", () => {
  it("maps available components into form fields", () => {
    expect(mapReverseGeocodeToFill(sample)).toEqual({
      zipCode: "01001-000",
      street: "Praça da Sé",
      number: "100",
      complement: "Bloco A",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    });
  });

  it("omits null or incomplete components", () => {
    expect(
      mapReverseGeocodeToFill({
        ...sample,
        zipCode: null,
        streetName: null,
        streetNumber: null,
        streetComplement: null,
        streetDistrict: "Centro",
        city: "Fortaleza",
        state: "CE",
      }),
    ).toEqual({
      neighborhood: "Centro",
      city: "Fortaleza",
      state: "CE",
    });
  });
});

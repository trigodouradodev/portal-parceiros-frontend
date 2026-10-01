import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import { mapAddressToApi } from "@/features/originacao/mappers/map-address-to-api";

describe("mapAddressToApi", () => {
  it("maps form address fields to the address PATCH payload", () => {
    const form = createEmptyProposalForm().address;
    expect(
      mapAddressToApi({
        ...form,
        zipCode: "01001-000",
        street: "Praça da Sé",
        number: "100",
        complement: "Apto 12",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        landmark: "Próximo à estação",
      }),
    ).toEqual({
      zipCode: "01001-000",
      streetName: "Praça da Sé",
      streetNumber: "100",
      streetComplement: "Apto 12",
      streetDistrict: "Sé",
      city: "São Paulo",
      state: "SP",
      referencePoint: "Próximo à estação",
    });
  });

  it("omits empty complement", () => {
    const form = createEmptyProposalForm().address;
    const payload = mapAddressToApi({
      ...form,
      zipCode: "01001-000",
      street: "Praça da Sé",
      number: "100",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      landmark: "Estação Sé",
    });
    expect(payload.streetComplement).toBeUndefined();
    expect(payload.referencePoint).toBe("Estação Sé");
  });

  it("includes geolocation when captured", () => {
    const form = createEmptyProposalForm().address;
    const payload = mapAddressToApi({
      ...form,
      zipCode: "01001-000",
      street: "Praça da Sé",
      number: "100",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      landmark: "Estação Sé",
      geolocation: {
        latitude: -23.55052,
        longitude: -46.633308,
        precision: "15m",
      },
    });
    expect(payload.geolocation).toEqual({
      latitude: -23.55052,
      longitude: -46.633308,
      precision: "15m",
    });
  });
});

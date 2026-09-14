import { describe, expect, it } from "vitest";
import {
  formatPartyTelephone,
  mapPartyToGuarantorFill,
} from "@/features/originacao/mappers/map-party-to-guarantor";
import type { PartyFormData } from "@/services/parties/parties.types";

const party: PartyFormData = {
  name: "Maria Souza",
  document: "52998224725",
  email: "maria@email.com",
  telephone: "+5511987654321",
  address: {
    zipCode: "01001000",
    streetName: "Praça da Sé",
    streetNumber: "100",
    streetComplement: "Apto 12",
    streetDistrict: "Sé",
    city: "São Paulo",
    state: "sp",
  },
};

describe("formatPartyTelephone", () => {
  it("strips DDI 55 before masking", () => {
    expect(formatPartyTelephone("+5511987654321")).toBe("(11) 98765-4321");
    expect(formatPartyTelephone("11987654321")).toBe("(11) 98765-4321");
  });
});

describe("mapPartyToGuarantorFill", () => {
  it("maps identity and address without CPF", () => {
    expect(mapPartyToGuarantorFill(party)).toEqual({
      name: "Maria Souza",
      email: "maria@email.com",
      phone: "(11) 98765-4321",
      zipCode: "01001-000",
      street: "Praça da Sé",
      number: "100",
      complement: "Apto 12",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    });
  });

  it("omits empty optional fields and null address", () => {
    expect(
      mapPartyToGuarantorFill({
        name: "Maria Souza",
        document: "52998224725",
        email: null,
        telephone: null,
        address: null,
      }),
    ).toEqual({ name: "Maria Souza" });
  });
});

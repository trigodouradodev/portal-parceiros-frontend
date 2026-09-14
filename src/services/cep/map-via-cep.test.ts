import { describe, expect, it } from "vitest";
import { mapViaCepResponse } from "@/services/cep/map-via-cep";

describe("mapViaCepResponse", () => {
  it("maps ViaCEP fields to the origination form", () => {
    expect(
      mapViaCepResponse({
        cep: "63031-130",
        logradouro: "Rua Artesão Manoel Barros",
        complemento: "",
        bairro: "Tiradentes",
        localidade: "Juazeiro do Norte",
        uf: "CE",
        estado: "Ceará",
      }),
    ).toEqual({
      zipCode: "63031-130",
      street: "Rua Artesão Manoel Barros",
      neighborhood: "Tiradentes",
      city: "Juazeiro do Norte",
      state: "CE",
    });
  });

  it("keeps street and neighborhood empty for city-level CEPs", () => {
    expect(
      mapViaCepResponse({
        cep: "63000000",
        logradouro: "",
        bairro: "  ",
        localidade: "Juazeiro do Norte",
        uf: "ce",
      }),
    ).toEqual({
      zipCode: "63000-000",
      street: "",
      neighborhood: "",
      city: "Juazeiro do Norte",
      state: "CE",
    });
  });
});

import { describe, expect, it } from "vitest";
import { createEmptyProposalForm } from "@/features/originacao/data/proposal";
import { mapGuarantorToApi } from "@/features/originacao/mappers/map-guarantor-to-api";
import { GuarantorRelationship } from "@/services/quotes/quotes.enums";

describe("mapGuarantorToApi", () => {
  it("nests address and maps kinship to relationship", () => {
    const form = createEmptyProposalForm().guarantor;
    expect(
      mapGuarantorToApi({
        ...form,
        name: "João Souza",
        cpf: "390.533.447-05",
        birthDate: "1988-03-15",
        email: "joao@email.com",
        phone: "(11) 98765-4321",
        zipCode: "01001-000",
        street: "Praça da Sé",
        number: "100",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        kinship: GuarantorRelationship.SPOUSE,
      }),
    ).toEqual({
      name: "João Souza",
      document: "390.533.447-05",
      birthDate: "1988-03-15",
      email: "joao@email.com",
      telephone: "(11) 98765-4321",
      address: {
        zipCode: "01001-000",
        streetName: "Praça da Sé",
        streetNumber: "100",
        streetDistrict: "Sé",
        city: "São Paulo",
        state: "SP",
      },
      relationship: GuarantorRelationship.SPOUSE,
    });
  });

  it("omits empty complement", () => {
    const form = createEmptyProposalForm().guarantor;
    const payload = mapGuarantorToApi({
      ...form,
      name: "João Souza",
      cpf: "390.533.447-05",
      birthDate: "1988-03-15",
      email: "joao@email.com",
      phone: "(11) 98765-4321",
      zipCode: "01001-000",
      street: "Praça da Sé",
      number: "100",
      complement: "",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      kinship: GuarantorRelationship.PARENT,
    });
    expect(payload.address.streetComplement).toBeUndefined();
  });
});

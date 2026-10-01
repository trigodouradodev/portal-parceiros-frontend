import { partyFillUpdates } from "@/features/originacao/utils/party-fill-updates";

const FIELDS = ["name", "email", "phone"] as const;

function valuesOf(form: Record<string, string>) {
  return (field: string) => form[field];
}

describe("partyFillUpdates", () => {
  it("writes every field the new record has", () => {
    expect(
      partyFillUpdates(
        FIELDS,
        {},
        { name: "Maria", email: "maria@email.com" },
        valuesOf({ name: "", email: "", phone: "" }),
      ),
    ).toEqual([
      ["name", "Maria"],
      ["email", "maria@email.com"],
    ]);
  });

  it("clears fields that still hold the previous record", () => {
    expect(
      partyFillUpdates(
        FIELDS,
        { name: "Maria", email: "maria@email.com" },
        {},
        valuesOf({ name: "Maria", email: "maria@email.com", phone: "" }),
      ),
    ).toEqual([
      ["name", ""],
      ["email", ""],
    ]);
  });

  it("keeps fields the user edited after the previous fill", () => {
    expect(
      partyFillUpdates(
        FIELDS,
        { name: "Maria", email: "maria@email.com" },
        {},
        valuesOf({ name: "Maria", email: "novo@email.com", phone: "" }),
      ),
    ).toEqual([["name", ""]]);
  });

  it("clears what the next record lacks and writes what it has", () => {
    expect(
      partyFillUpdates(
        FIELDS,
        { name: "Maria", email: "maria@email.com", phone: "(11) 98765-4321" },
        { name: "João" },
        valuesOf({
          name: "Maria",
          email: "maria@email.com",
          phone: "(11) 98765-4321",
        }),
      ),
    ).toEqual([
      ["name", "João"],
      ["email", ""],
      ["phone", ""],
    ]);
  });

  it("never touches fields typed without a record", () => {
    expect(
      partyFillUpdates(
        FIELDS,
        {},
        {},
        valuesOf({ name: "Digitado", email: "", phone: "" }),
      ),
    ).toEqual([]);
  });
});

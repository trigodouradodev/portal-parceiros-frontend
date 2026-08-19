import { describe, expect, it } from "vitest";
import { firstErrorPath } from "@/features/originacao/utils/scroll-to-first-error";

describe("firstErrorPath", () => {
  it("returns the first nested field with a message", () => {
    expect(
      firstErrorPath({
        registration: {
          gender: { type: "manual", message: "Campo obrigatório" },
        },
      }),
    ).toBe("registration.gender");
  });

  it("prefers earlier keys in object order", () => {
    expect(
      firstErrorPath({
        nome: { type: "manual", message: "Informe o nome" },
        cpf: { type: "manual", message: "CPF inválido" },
      }),
    ).toBe("nome");
  });
});

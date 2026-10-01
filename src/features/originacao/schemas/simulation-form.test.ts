import { describe, expect, it } from "vitest";
import { createSimulationSchema } from "@/features/originacao/schemas/simulation-form";

const today = new Date(2026, 7, 26);
const productId = "11111111-1111-4111-8111-111111111111";

function validValues() {
  return {
    name: "Maria Souza",
    cpf: "529.982.247-25",
    birthDate: "1990-05-20",
    email: "maria@email.com",
    phone: "(11) 98765-4321",
    product: productId,
    amount: 5000,
    installments: 10,
    dueDate: new Date(2026, 8, 10),
  };
}

describe("createSimulationSchema", () => {
  const schema = createSimulationSchema({
    installmentOptions: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    today,
  });

  it("accepts a valid payload", () => {
    expect(schema.safeParse(validValues()).success).toBe(true);
  });

  it("rejects a name shorter than 3 characters", () => {
    const result = schema.safeParse({ ...validValues(), name: "Jo" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Informe o nome completo");
    }
  });

  it("rejects installments outside the product range", () => {
    const productSchema = createSimulationSchema({
      installmentOptions: [4, 5, 6],
      today,
    });
    const result = productSchema.safeParse({
      ...validValues(),
      installments: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Número de parcelas deve estar entre 4 e 6.",
      );
    }
  });

  it("rejects a due date that is not 5, 10, 15 or 20", () => {
    const result = schema.safeParse({
      ...validValues(),
      dueDate: new Date(2026, 8, 11),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A primeira parcela deve cair no dia 5, 10, 15 ou 20.",
      );
    }
  });

  it("rejects a due date before today", () => {
    const result = schema.safeParse({
      ...validValues(),
      dueDate: new Date(2026, 7, 20),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A data da primeira parcela deve ser hoje ou futura.",
      );
    }
  });

  it("rejects a due date after D+45", () => {
    const result = schema.safeParse({
      ...validValues(),
      dueDate: new Date(2026, 9, 15),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A primeira parcela deve estar em até 45 dias.",
      );
    }
  });
});

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
    dueDate: new Date(2026, 8, 15),
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

  it.each([500, 600, 2100, 30000])(
    "accepts a multiple of 100 of %s reais",
    (amount) => {
      expect(schema.safeParse({ ...validValues(), amount }).success).toBe(true);
    },
  );

  it.each([499, 30001, 500.5, 550, 2137, Number.NaN])(
    "rejects invalid amount %s",
    (amount) => {
      const result = schema.safeParse({ ...validValues(), amount });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path[0] === "amount"),
        ).toBe(true);
      }
    },
  );

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

  // Hoje = 26/08/2026: janela de 15/09 a 10/10.
  const WINDOW_MESSAGE =
    "A primeira parcela deve cair entre 15/09/2026 e 10/10/2026, em um dia de 1 a 20 do mês.";

  it.each([
    ["the first accepted day (today + 20)", new Date(2026, 8, 15)],
    ["the last accepted day (today + 45)", new Date(2026, 9, 10)],
    ["day 20 inside the window", new Date(2026, 8, 20)],
    ["day 1 inside the window", new Date(2026, 9, 1)],
  ])("accepts %s", (_name, dueDate) => {
    expect(schema.safeParse({ ...validValues(), dueDate }).success).toBe(true);
  });

  it.each([
    ["before the minimum (today + 19)", new Date(2026, 8, 14)],
    ["today", new Date(2026, 7, 26)],
    ["a past date", new Date(2026, 7, 20)],
    ["after the maximum (today + 46)", new Date(2026, 9, 11)],
    ["day 21 inside the window", new Date(2026, 8, 21)],
    ["day 31 inside the window", new Date(2026, 8, 30)],
  ])("rejects %s with the window in the message", (_name, dueDate) => {
    const result = schema.safeParse({ ...validValues(), dueDate });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(WINDOW_MESSAGE);
    }
  });

  describe("editing an old draft (stored due date)", () => {
    const draftSchema = (storedDueDate: Date) =>
      createSimulationSchema({
        installmentOptions: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        today,
        storedDueDate,
      });

    it("keeps an unchanged date that is under the new minimum", () => {
      const stored = new Date(2026, 8, 10); // today + 15, day 10
      const result = draftSchema(stored).safeParse({
        ...validValues(),
        dueDate: stored,
      });
      expect(result.success).toBe(true);
    });

    it("keeps an unchanged date on a day the new rule would reject", () => {
      const stored = new Date(2026, 8, 25); // day 25
      const result = draftSchema(stored).safeParse({
        ...validValues(),
        dueDate: stored,
      });
      expect(result.success).toBe(true);
    });

    it("still rejects an unchanged date that is already in the past", () => {
      const stored = new Date(2026, 7, 20);
      const result = draftSchema(stored).safeParse({
        ...validValues(),
        dueDate: stored,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "A data da primeira parcela deve ser hoje ou futura.",
        );
      }
    });

    it("applies the new rule to a changed date", () => {
      const result = draftSchema(new Date(2026, 8, 10)).safeParse({
        ...validValues(),
        dueDate: new Date(2026, 8, 12),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(WINDOW_MESSAGE);
      }
    });
  });
});

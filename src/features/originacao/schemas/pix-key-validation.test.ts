import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  PIX_RANDOM_KEY_UUID_REGEX,
  addPaymentPixFormatIssues,
} from "@/features/originacao/schemas/pix-key-validation";
import { PaymentPixType } from "@/services/quotes/quotes.enums";

function collectPixIssues(paymentPixType: string, paymentPixCode: string) {
  const result = z
    .object({
      paymentPixType: z.string(),
      paymentPixCode: z.string(),
    })
    .superRefine((data, ctx) => {
      addPaymentPixFormatIssues(data, ctx);
    })
    .safeParse({ paymentPixType, paymentPixCode });

  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}

describe("PIX_RANDOM_KEY_UUID_REGEX", () => {
  it("accepts a BACEN EVP UUID", () => {
    expect(
      PIX_RANDOM_KEY_UUID_REGEX.test("4ca519ef-0ccc-4c41-b58b-c88f1f47d8ab"),
    ).toBe(true);
  });

  it("rejects a non-UUID key", () => {
    expect(PIX_RANDOM_KEY_UUID_REGEX.test("abc123")).toBe(false);
  });
});

describe("addPaymentPixFormatIssues", () => {
  it("accepts a valid email key", () => {
    expect(
      collectPixIssues(PaymentPixType.EMAIL, "cliente@exemplo.com"),
    ).toEqual([]);
  });

  it("rejects an invalid email key", () => {
    expect(collectPixIssues(PaymentPixType.EMAIL, "nao-e-email")).toContain(
      "Chave PIX EMAIL inválida.",
    );
  });

  it("accepts a valid CPF key", () => {
    expect(collectPixIssues(PaymentPixType.CPF, "529.982.247-25")).toEqual([]);
  });

  it("rejects a short CPF key", () => {
    expect(collectPixIssues(PaymentPixType.CPF, "123")).toContain(
      "Chave PIX CPF deve conter apenas números e ter 11 dígitos.",
    );
  });

  it("rejects a repeated CPF", () => {
    expect(collectPixIssues(PaymentPixType.CPF, "11111111111")).toContain(
      "Chave PIX CPF inválida.",
    );
  });

  it("accepts a mobile PIX key", () => {
    expect(collectPixIssues(PaymentPixType.TELEPHONE, "11991234567")).toEqual(
      [],
    );
  });

  it("rejects a landline as PIX phone", () => {
    expect(collectPixIssues(PaymentPixType.TELEPHONE, "1133334444")).toContain(
      "Chave PIX celular deve estar no formato (DD) 9XXXX-XXXX.",
    );
  });

  it("accepts a random UUID key", () => {
    expect(
      collectPixIssues(
        PaymentPixType.RANDOM_KEY,
        "4ca519ef-0ccc-4c41-b58b-c88f1f47d8ab",
      ),
    ).toEqual([]);
  });
});

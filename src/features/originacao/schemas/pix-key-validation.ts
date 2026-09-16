import type { RefinementCtx } from "zod";
import { PaymentPixType } from "@/services/quotes/quotes.enums";
import { isValidCpf } from "@/lib/validation/cpf";

/** Chave aleatória PIX (EVP): UUID no padrão BACEN. */
export const PIX_RANDOM_KEY_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export type PaymentPixFields = {
  paymentPixType: string;
  paymentPixCode: string;
};

function localPhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) {
    return digits.slice(2);
  }
  return digits;
}

export function normalizePaymentPixCode(type: string, code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return "";

  switch (type) {
    case PaymentPixType.CPF:
      return trimmed.replace(/\D/g, "");
    case PaymentPixType.TELEPHONE: {
      const local = localPhoneDigits(trimmed);
      return local ? `+55${local}` : "";
    }
    case PaymentPixType.EMAIL:
    case PaymentPixType.RANDOM_KEY:
      return trimmed.toLowerCase();
    default:
      return trimmed;
  }
}

export function addPaymentPixFormatIssues(
  data: PaymentPixFields,
  ctx: RefinementCtx,
  path: (string | number)[] = ["paymentPixCode"],
): void {
  const code = data.paymentPixCode.trim();
  if (!code) return;

  switch (data.paymentPixType) {
    case PaymentPixType.EMAIL: {
      if (!EMAIL_PATTERN.test(code.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          message: "Chave PIX EMAIL inválida.",
          path,
        });
      }
      break;
    }
    case PaymentPixType.CPF: {
      const digits = code.replace(/\D/g, "");
      if (digits.length !== 11) {
        ctx.addIssue({
          code: "custom",
          message: "Chave PIX CPF deve conter apenas números e ter 11 dígitos.",
          path,
        });
        break;
      }
      if (!isValidCpf(digits)) {
        ctx.addIssue({
          code: "custom",
          message: "Chave PIX CPF inválida.",
          path,
        });
      }
      break;
    }
    case PaymentPixType.TELEPHONE: {
      const local = localPhoneDigits(code);
      if (local.length !== 11 || local[2] !== "9") {
        ctx.addIssue({
          code: "custom",
          message: "Chave PIX celular deve estar no formato (DD) 9XXXX-XXXX.",
          path,
        });
      }
      break;
    }
    case PaymentPixType.RANDOM_KEY: {
      if (!PIX_RANDOM_KEY_UUID_REGEX.test(code)) {
        ctx.addIssue({
          code: "custom",
          message:
            "Chave PIX aleatória inválida. Informe um UUID no formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.",
          path,
        });
      }
      break;
    }
    default:
      break;
  }
}

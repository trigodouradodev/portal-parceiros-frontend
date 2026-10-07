import { z } from "zod";
import { calcAge, isAdultAge } from "@/features/originacao/utils/calc-age";

export const CLIENT_BIRTH_DATE_MESSAGE =
  "O cliente deve ter entre 18 e 120 anos.";
export const GUARANTOR_BIRTH_DATE_MESSAGE =
  "O avalista deve ter entre 18 e 120 anos.";
export const INVALID_BIRTH_DATE_MESSAGE =
  "Data inválida. Digite no formato dd/mm/aaaa.";

export function birthDateSchema(underageMessage: string) {
  return z
    .string()
    .min(1, "Informe a data de nascimento")
    .superRefine((value, ctx) => {
      if (!value) return;
      const age = calcAge(value);
      if (age === null) {
        ctx.addIssue({ code: "custom", message: INVALID_BIRTH_DATE_MESSAGE });
      } else if (!isAdultAge(age)) {
        ctx.addIssue({ code: "custom", message: underageMessage });
      }
    });
}

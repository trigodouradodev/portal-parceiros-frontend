import { z } from "zod";
import { calcAge, isAdultAge } from "@/features/originacao/utils/calc-age";

export const CLIENT_BIRTH_DATE_MESSAGE =
  "O cliente deve ter entre 18 e 120 anos.";
export const GUARANTOR_BIRTH_DATE_MESSAGE =
  "O avalista deve ter entre 18 e 120 anos.";

export function birthDateSchema(underageMessage: string) {
  return z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine((value) => isAdultAge(calcAge(value)), underageMessage);
}

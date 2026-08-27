import { z } from "zod";
import {
  CLIENT_BIRTH_DATE_MESSAGE,
  birthDateSchema,
} from "@/features/originacao/schemas/birth-date";
import { isValidCpf } from "@/lib/validation/cpf";

export const eligibilitySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  birthDate: birthDateSchema(CLIENT_BIRTH_DATE_MESSAGE),
});

export type EligibilityFormValues = z.infer<typeof eligibilitySchema>;

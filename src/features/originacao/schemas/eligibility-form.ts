import { z } from "zod";
import { calcAge, isAdultAge } from "@/features/originacao/utils/calc-age";
import { isValidCpf } from "@/lib/validation/cpf";

export const eligibilitySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  birthDate: z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine(
      (value) => isAdultAge(calcAge(value)),
      "O cliente deve ter entre 18 e 120 anos.",
    ),
});

export type EligibilityFormValues = z.infer<typeof eligibilitySchema>;

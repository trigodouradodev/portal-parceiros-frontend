import { z } from "zod";
import { AMOUNT_MAX, AMOUNT_MIN } from "@/features/originacao/data/simulacao";
import { digitsOnlyPhone } from "@/lib/format/phone";
import { isValidCpf } from "@/lib/validation/cpf";

export const simulationSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  nascimento: z.string().min(1, "Informe a data de nascimento"),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail")
    .email("Informe um e-mail válido"),
  celular: z
    .string()
    .refine(
      (value) => digitsOnlyPhone(value).length >= 10,
      "Informe um celular válido",
    ),
  product: z.enum(["Pessoal", "Premium", "Giro"]),
  amount: z.number().min(AMOUNT_MIN).max(AMOUNT_MAX),
  installments: z.number().int().min(2).max(12),
  dueDate: z.date(),
});

export type SimulationFormValues = z.infer<typeof simulationSchema>;

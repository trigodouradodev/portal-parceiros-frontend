import { z } from "zod";
import {
  AMOUNT_MAX,
  AMOUNT_MIN,
  FIRST_INSTALLMENT_MAX_DAYS,
  isAllowedDueDate,
  isDueDateInWindow,
} from "@/features/originacao/data/simulacao";
import {
  CLIENT_BIRTH_DATE_MESSAGE,
  birthDateSchema,
} from "@/features/originacao/schemas/birth-date";
import { digitsOnlyPhone } from "@/lib/format/phone";
import { isValidCpf } from "@/lib/validation/cpf";

export function createSimulationSchema(options: {
  installmentOptions: number[];
  today: Date;
}) {
  const { installmentOptions, today } = options;
  const installmentMin = installmentOptions[0];
  const installmentMax = installmentOptions[installmentOptions.length - 1];

  return z.object({
    name: z.string().trim().min(3, "Informe o nome completo"),
    cpf: z.string().refine(isValidCpf, "CPF inválido"),
    birthDate: birthDateSchema(CLIENT_BIRTH_DATE_MESSAGE),
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail")
      .email("Informe um e-mail válido"),
    phone: z
      .string()
      .refine(
        (value) => digitsOnlyPhone(value).length >= 10,
        "Informe um celular válido",
      ),
    product: z.string().uuid("Selecione o produto"),
    amount: z.number().min(AMOUNT_MIN).max(AMOUNT_MAX),
    installments: z
      .number({ error: "Informe as parcelas" })
      .int()
      .superRefine((value, ctx) => {
        if (installmentOptions.includes(value)) return;
        ctx.addIssue({
          code: "custom",
          message:
            installmentMin != null && installmentMax != null
              ? `Número de parcelas deve estar entre ${installmentMin} e ${installmentMax}.`
              : "Informe as parcelas",
        });
      }),
    dueDate: z
      .date({ error: "Informe a data de vencimento" })
      .superRefine((date, ctx) => {
        if (!isAllowedDueDate(date)) {
          ctx.addIssue({
            code: "custom",
            message: "A primeira parcela deve cair no dia 5, 10, 15 ou 20.",
          });
          return;
        }

        if (isDueDateInWindow(date, today)) return;

        const start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        ).getTime();
        const value = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ).getTime();

        ctx.addIssue({
          code: "custom",
          message:
            value < start
              ? "A data da primeira parcela deve ser hoje ou futura."
              : `A primeira parcela deve estar em até ${FIRST_INSTALLMENT_MAX_DAYS} dias.`,
        });
      }),
  });
}

export type SimulationFormValues = z.infer<
  ReturnType<typeof createSimulationSchema>
>;

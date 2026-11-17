import { z } from "zod";
import {
  AMOUNT_MAX,
  AMOUNT_MIN,
  firstInstallmentRuleMessage,
  isAllowedDueDate,
  isDueDateInWindow,
  isSameCalendarDay,
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
  /**
   * Só na edição de um rascunho: a data hoje gravada. Se o parceiro não a
   * trocar, a regra nova da data não se aplica (a proposta antiga segue
   * editável); só não pode estar no passado, como antes.
   */
  storedDueDate?: Date;
}) {
  const { installmentOptions, today, storedDueDate } = options;
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
    amount: z
      .number({ error: "Informe quanto o cliente precisa" })
      .int("Informe um valor inteiro em reais, sem centavos")
      .min(AMOUNT_MIN, "O valor mínimo é R$ 500,00")
      .max(AMOUNT_MAX, "O valor máximo é R$ 30.000,00")
      .multipleOf(100, "Informe um valor múltiplo de R$ 100,00"),
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
        if (storedDueDate && isSameCalendarDay(date, storedDueDate)) {
          if (date.getTime() < today.getTime()) {
            ctx.addIssue({
              code: "custom",
              message: "A data da primeira parcela deve ser hoje ou futura.",
            });
          }
          return;
        }

        if (isAllowedDueDate(date) && isDueDateInWindow(date, today)) return;

        ctx.addIssue({
          code: "custom",
          message: firstInstallmentRuleMessage(today),
        });
      }),
  });
}

/** Campos comerciais editáveis de uma proposta em rascunho (AUREA-701). */
export function createDraftSimulationSchema(options: {
  installmentOptions: number[];
  today: Date;
  storedDueDate?: Date;
}) {
  return createSimulationSchema(options).pick({
    product: true,
    amount: true,
    installments: true,
    dueDate: true,
  });
}

export type DraftSimulationFormValues = z.infer<
  ReturnType<typeof createDraftSimulationSchema>
>;

export type SimulationFormValues = z.infer<
  ReturnType<typeof createSimulationSchema>
>;

import { z } from "zod";
import { digitsOnlyPhone } from "@/features/profile/utils/phone";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Informe seu nome completo.")
    .max(255, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido.")
    .max(255, "E-mail muito longo."),
  phone: z
    .string()
    .trim()
    .min(1, "Informe seu telefone.")
    .refine(
      (value) => digitsOnlyPhone(value).length >= 10,
      "Informe um telefone válido, com DDD.",
    ),
});

export const passwordSchema = z
  .object({
    currentPwd: z.string().min(1, "Informe a senha atual."),
    newPwd: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
    confirmPwd: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((values) => values.newPwd === values.confirmPwd, {
    message: "As senhas não coincidem.",
    path: ["confirmPwd"],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

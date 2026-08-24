import { z } from "zod";
import { digitsOnlyPhone } from "@/lib/format/phone";

// E-mail não faz parte do formulário: é o login do usuário, não é editável
// por aqui (ver ProfilePage/PersonalDataSection, que mostram o valor atual
// só como leitura).
export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Informe seu nome completo.")
    .max(255, "Nome muito longo."),
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
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres.")
      .max(72, "A senha deve ter no máximo 72 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["newPassword"],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

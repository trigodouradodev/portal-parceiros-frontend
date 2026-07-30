import { Loader2, Lock } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PasswordTextField } from "@/features/profile/components/PasswordTextField";
import type { PasswordFormValues } from "@/features/profile/schemas/profile-form";

interface PasswordSectionProps {
  form: UseFormReturn<PasswordFormValues>;
  passwordFilled: boolean;
  saving: boolean;
  onSubmit: (values: PasswordFormValues) => void;
}

export function PasswordSection({
  form,
  passwordFilled,
  saving,
  onSubmit,
}: PasswordSectionProps) {
  return (
    <section className="rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-[#1A1D2E]">Alterar senha</h2>

      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <PasswordTextField
            control={form.control}
            name="currentPwd"
            label="Senha atual"
            placeholder="••••••••"
          />
          <PasswordTextField
            control={form.control}
            name="newPwd"
            label="Nova senha"
            placeholder="••••••••"
            hint="Mínimo de 8 caracteres."
          />
          <PasswordTextField
            control={form.control}
            name="confirmPwd"
            label="Confirmar nova senha"
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="mt-5 h-11 w-full gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
            disabled={!passwordFilled || saving}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Lock size={15} />
            )}
            {saving ? "Alterando..." : "Alterar senha"}
          </Button>
        </form>
      </Form>
    </section>
  );
}

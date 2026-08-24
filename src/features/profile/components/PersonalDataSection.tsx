import { CheckCircle2, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProfileTextField } from "@/features/profile/components/ProfileTextField";
import type { ProfileFormValues } from "@/features/profile/schemas/profile-form";
import { formatPhoneDisplay } from "@/lib/format/phone";

interface PersonalDataSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  /** E-mail atual — só leitura aqui, é o login do usuário. */
  email: string;
  dataChanged: boolean;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: ProfileFormValues) => void;
}

export function PersonalDataSection({
  form,
  email,
  dataChanged,
  saving,
  onCancel,
  onSubmit,
}: PersonalDataSectionProps) {
  return (
    <section className="mb-4 rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-[#1A1D2E]">Dados pessoais</h2>

      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <ProfileTextField
            control={form.control}
            name="fullName"
            label="Nome completo"
            icon={<User size={16} />}
            placeholder="Seu nome"
            autoComplete="name"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1A1D2E]">E-mail</label>
            <div className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-[#F5F6FA] px-4 py-3 opacity-70">
              <span className="shrink-0 text-[#9DA3B4]">
                <Mail size={16} />
              </span>
              <span className="flex-1 truncate text-sm text-[#1A1D2E]">
                {email}
              </span>
              <span className="shrink-0 text-[#9DA3B4]" aria-hidden>
                <Lock size={14} />
              </span>
            </div>
            <p className="text-xs text-[#9DA3B4]">
              É o e-mail usado pra entrar no Portal — não pode ser alterado
              aqui.
            </p>
          </div>
          <ProfileTextField
            control={form.control}
            name="phone"
            label="Telefone"
            icon={<Phone size={16} />}
            placeholder="(11) 99999-0000"
            type="tel"
            autoComplete="tel"
            transform={formatPhoneDisplay}
          />

          <div className="mt-5 flex gap-2">
            {dataChanged && (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl px-5"
                disabled={saving}
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              className="h-11 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
              disabled={saving || !dataChanged}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Salvar dados
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

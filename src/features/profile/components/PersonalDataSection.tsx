import { CheckCircle2, Loader2, Mail, Phone, User } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProfileTextField } from "@/features/profile/components/ProfileTextField";
import type { ProfileFormValues } from "@/features/profile/schemas/profile-form";
import { formatPhoneDisplay } from "@/features/profile/utils/phone";

interface PersonalDataSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  dataChanged: boolean;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: ProfileFormValues) => void;
}

export function PersonalDataSection({
  form,
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
          <ProfileTextField
            control={form.control}
            name="email"
            label="E-mail"
            icon={<Mail size={16} />}
            placeholder="seu@email.com"
            type="email"
            autoComplete="email"
          />
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

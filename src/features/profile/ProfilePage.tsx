import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth/auth-context";
import { useToast } from "@/contexts/toast/toast-context";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";
import { getRoleLabel } from "@/features/profile/utils/role-label";
import {
  digitsOnlyPhone,
  formatPhoneDisplay,
} from "@/features/profile/utils/phone";
import { getInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import type { UpdateProfileRequest } from "@/services/auth/types";
import { useOutletContext } from "react-router-dom";

const profileSchema = z.object({
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

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ShellContext {
  onMobileLogout?: () => void;
}

function FieldInput({
  label,
  value,
  onChange,
  icon,
  placeholder,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border-2 bg-[#F5F6FA] px-4 py-3 transition-colors",
          error
            ? "border-destructive"
            : "border-transparent focus-within:border-brand-navy",
        )}
      >
        <span className="shrink-0 text-muted-foreground/60">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { onMobileLogout } = useOutletContext<ShellContext>();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const { reset, watch, setError, formState, handleSubmit } = form;
  const values = watch();

  useEffect(() => {
    if (!user) return;
    reset({
      fullName: user.full_name ?? "",
      email: user.email ?? "",
      phone: formatPhoneDisplay(user.phone_number ?? ""),
    });
  }, [user, reset]);

  const baselineName = user?.full_name ?? "";
  const baselineEmail = user?.email ?? "";
  const baselinePhoneDigits = digitsOnlyPhone(user?.phone_number ?? "");

  const dataChanged =
    values.fullName.trim() !== baselineName.trim() ||
    values.email.trim().toLowerCase() !== baselineEmail.trim().toLowerCase() ||
    digitsOnlyPhone(values.phone) !== baselinePhoneDigits;

  const handleCancel = () => {
    if (!user) return;
    reset({
      fullName: user.full_name ?? "",
      email: user.email ?? "",
      phone: formatPhoneDisplay(user.phone_number ?? ""),
    });
  };

  const onSubmit = handleSubmit(async (formValues) => {
    if (!user) return;

    const payload: UpdateProfileRequest = {};
    const nextName = formValues.fullName.trim();
    const nextEmail = formValues.email.trim().toLowerCase();
    const nextPhone = digitsOnlyPhone(formValues.phone);

    if (nextName !== baselineName.trim()) {
      payload.fullName = nextName;
    }
    if (nextEmail !== baselineEmail.trim().toLowerCase()) {
      payload.email = nextEmail;
    }
    if (nextPhone !== baselinePhoneDigits) {
      payload.phoneNumber = nextPhone || null;
    }

    if (Object.keys(payload).length === 0) {
      showToast("Nenhuma alteração para salvar.", { variant: "destructive" });
      return;
    }

    try {
      await updateProfile.mutateAsync(payload);
      showToast("Dados atualizados com sucesso.");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        const code = Array.isArray(message) ? message.join(",") : message;

        if (err.response?.status === 409 || code === "email_already_in_use") {
          setError("email", {
            type: "server",
            message: "Este e-mail já está em uso.",
          });
          return;
        }

        if (code === "no_fields_to_update") {
          showToast("Nenhuma alteração para salvar.", {
            variant: "destructive",
          });
          return;
        }

        if (!err.response) {
          showToast(
            "Sem conexão. Verifique sua internet e tente novamente.",
            { variant: "destructive" },
          );
          return;
        }
      }

      showToast("Não foi possível salvar. Tente novamente.", {
        variant: "destructive",
      });
    }
  });

  const displayName = values.fullName.trim() || user?.full_name || "Parceiro";
  const roleLabel = getRoleLabel(user?.role);
  const saving = updateProfile.isPending || formState.isSubmitting;

  return (
    <PageContainer>
      <PageHeader
        subtitle="Gerencie seus dados de acesso"
        onLogout={onMobileLogout}
      />

      <div className="max-w-xl flex-1 px-5 pb-8 pt-5 md:px-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xl font-bold text-brand-navy">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-fraunces text-xl font-bold text-foreground">
              {displayName}
            </p>
            <p className="text-sm text-muted-foreground/70">{roleLabel}</p>
          </div>
        </div>

        <section className="mb-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">Dados pessoais</h2>

          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <FieldInput
              label="Nome completo"
              value={values.fullName}
              onChange={(value) =>
                form.setValue("fullName", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              icon={<User size={16} />}
              placeholder="Seu nome"
              autoComplete="name"
              error={formState.errors.fullName?.message}
            />
            <FieldInput
              label="E-mail"
              value={values.email}
              onChange={(value) =>
                form.setValue("email", value, {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              icon={<Mail size={16} />}
              placeholder="seu@email.com"
              type="email"
              autoComplete="email"
              error={formState.errors.email?.message}
            />
            <FieldInput
              label="Telefone"
              value={values.phone}
              onChange={(value) =>
                form.setValue("phone", formatPhoneDisplay(value), {
                  shouldDirty: true,
                  shouldValidate: formState.isSubmitted,
                })
              }
              icon={<Phone size={16} />}
              placeholder="(11) 99999-0000"
              type="tel"
              autoComplete="tel"
              error={formState.errors.phone?.message}
            />

            <div className="mt-1 flex gap-2">
              {dataChanged && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl px-5"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                className="h-11 flex-1 gap-2 rounded-2xl font-semibold"
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
        </section>
      </div>
    </PageContainer>
  );
}

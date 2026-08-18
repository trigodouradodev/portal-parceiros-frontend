import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/auth/auth-context";
import { useToast } from "@/contexts/toast/toast-context";
import { PasswordSection } from "@/features/profile/components/PasswordSection";
import { PersonalDataSection } from "@/features/profile/components/PersonalDataSection";
import { ProfileAvatarHeader } from "@/features/profile/components/ProfileAvatarHeader";
import { useChangePassword } from "@/features/profile/hooks/useChangePassword";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";
import {
  passwordSchema,
  profileSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from "@/features/profile/schemas/profile-form";
import { digitsOnlyPhone, formatPhoneDisplay } from "@/lib/format/phone";
import { getRoleLabel } from "@/lib/user-display";
import type { UpdateProfileRequest } from "@/services/auth/types";

interface ShellContext {
  onMobileLogout?: () => void;
}

function apiErrorMessage(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined;
  const message = err.response?.data?.message;
  if (Array.isArray(message)) return message.join(",");
  if (typeof message === "string") return message;
  return undefined;
}

export function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { onMobileLogout } = useOutletContext<ShellContext>();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { reset, watch, setError, formState } = form;
  const values = watch();

  const {
    reset: resetPassword,
    watch: watchPassword,
    setError: setPasswordError,
    formState: passwordFormState,
  } = passwordForm;
  const passwordValues = watchPassword();

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

  const passwordFilled =
    passwordValues.currentPassword.length > 0 ||
    passwordValues.newPassword.length > 0 ||
    passwordValues.confirmPassword.length > 0;

  const handleCancel = () => {
    if (!user) return;
    reset({
      fullName: user.full_name ?? "",
      email: user.email ?? "",
      phone: formatPhoneDisplay(user.phone_number ?? ""),
    });
  };

  const onSubmit = async (formValues: ProfileFormValues) => {
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
        const code = apiErrorMessage(err);

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
          showToast("Sem conexão. Verifique sua internet e tente novamente.", {
            variant: "destructive",
          });
          return;
        }
      }

      showToast("Não foi possível salvar. Tente novamente.", {
        variant: "destructive",
      });
    }
  };

  const onPasswordSubmit = async (formValues: PasswordFormValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      });
      resetPassword();
      showToast("Senha alterada com sucesso.");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = apiErrorMessage(err) ?? "";

        if (err.response?.status === 401) {
          setPasswordError("currentPassword", {
            type: "server",
            message: "Senha atual incorreta.",
          });
          return;
        }

        if (
          err.response?.status === 400 &&
          message.toLowerCase().includes("diferente")
        ) {
          setPasswordError("newPassword", {
            type: "server",
            message: "A nova senha deve ser diferente da atual.",
          });
          return;
        }

        if (!err.response) {
          showToast("Sem conexão. Verifique sua internet e tente novamente.", {
            variant: "destructive",
          });
          return;
        }
      }

      showToast("Não foi possível alterar a senha. Tente novamente.", {
        variant: "destructive",
      });
    }
  };

  const displayName = values.fullName.trim() || user?.full_name || "Parceiro";
  const roleLabel = getRoleLabel(user?.role);
  const saving = updateProfile.isPending || formState.isSubmitting;
  const passwordSaving =
    changePassword.isPending || passwordFormState.isSubmitting;

  const handleCameraClick = () => {
    showToast("Upload de foto ainda não está disponível.", {
      variant: "destructive",
    });
  };

  return (
    <PageContainer>
      <PageHeader
        subtitle="Gerencie seus dados de acesso"
        onLogout={onMobileLogout}
      />

      <div className="max-w-xl flex-1 px-5 pt-5 pb-8 md:px-8">
        <ProfileAvatarHeader
          displayName={displayName}
          roleLabel={roleLabel}
          onCameraClick={handleCameraClick}
        />

        <PersonalDataSection
          form={form}
          dataChanged={dataChanged}
          saving={saving}
          onCancel={handleCancel}
          onSubmit={onSubmit}
        />

        <PasswordSection
          form={passwordForm}
          passwordFilled={passwordFilled}
          saving={passwordSaving}
          onSubmit={onPasswordSubmit}
        />
      </div>
    </PageContainer>
  );
}

import { Mail, User, Briefcase, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth/auth-context";
import { getInitials, getRoleLabel } from "@/lib/user-display";

function ReadOnlyField({
  id,
  label,
  value,
  icon,
}: {
  id: string;
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      <p
        id={id}
        className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground"
      >
        {value}
      </p>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const displayName = user.full_name;
  const roleLabel = getRoleLabel(user.role);
  const initials = getInitials(displayName);

  return (
    <PageContainer>
      <div className="bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8">
        <h1 className="font-fraunces text-2xl font-bold text-white md:text-3xl">
          Perfil
        </h1>
        <p className="mt-0.5 text-sm text-white/60">Dados da sua conta</p>
      </div>

      <div className="px-5 pb-28 pt-6 md:px-8 md:pb-10">
        <div className="max-w-lg">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xl font-bold text-brand-navy">
              {initials}
            </div>
            <div>
              <h2 className="font-fraunces text-xl font-bold text-foreground">
                {displayName}
              </h2>
              <p className="text-sm text-muted-foreground">{roleLabel}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
              Dados do perfil
            </p>

            <ReadOnlyField
              id="profile-name"
              label="Nome completo"
              value={displayName}
              icon={<User size={13} className="text-muted-foreground/70" />}
            />

            <ReadOnlyField
              id="profile-role"
              label="Função"
              value={roleLabel}
              icon={
                <Briefcase size={13} className="text-muted-foreground/70" />
              }
            />

            <ReadOnlyField
              id="profile-email"
              label="E-mail"
              value={user.email}
              icon={<Mail size={13} className="text-muted-foreground/70" />}
            />

            <ReadOnlyField
              id="profile-permissions"
              label="Permissões"
              value={`${user.permissions.length} permissão${user.permissions.length !== 1 ? "es" : ""} ativas`}
              icon={<Shield size={13} className="text-muted-foreground/70" />}
            />

            <p className="text-xs text-muted-foreground/80">
              A edição de perfil estará disponível em uma próxima versão.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

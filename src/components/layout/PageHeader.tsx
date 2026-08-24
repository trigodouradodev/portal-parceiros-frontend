import { AureaLogo } from "@/components/brand/AureaLogo";
import { LogoutAvatarButton } from "@/components/layout/LogoutAvatarButton";
import { useAuth } from "@/contexts/auth/auth-context";
import { getFirstName, getGreeting, getInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  subtitle?: string;
  onLogout?: () => void;
  className?: string;
}

export function PageHeader({ subtitle, onLogout, className }: PageHeaderProps) {
  const { user } = useAuth();
  const displayName = user?.full_name ?? "Parceiro";
  const firstName = getFirstName(displayName);

  return (
    <div
      className={cn(
        "bg-brand-yellow px-5 pb-6 pt-8 md:px-8 md:pt-8",
        className,
      )}
    >
      {/*
        No mobile a AppSidebar (única fonte da marca "aurea" / "Portal
        Parceiro") fica escondida — sem BottomNav equivalente, a marca
        desaparecia por completo do app depois do login. md:hidden porque
        no desktop a sidebar já cobre isso.
      */}
      <div className="mb-4 flex flex-col gap-1 md:hidden">
        <AureaLogo size={30} />
        <span className="text-[10px] tracking-widest text-brand-navy/60 uppercase">
          Portal Parceiro
        </span>
      </div>
      <div className="mb-1 flex items-start justify-between md:mb-3">
        <div>
          <h1 className="font-fraunces text-2xl font-bold text-brand-navy md:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-brand-navy/60">{subtitle}</p>
          )}
        </div>
        {onLogout ? (
          <div className="mt-1 flex items-center gap-3">
            <LogoutAvatarButton
              initials={getInitials(displayName)}
              onLogout={onLogout}
              tone="onYellow"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

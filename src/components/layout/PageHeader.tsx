import { AureaLogoMark } from "@/components/brand/AureaLogo";
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
      className={cn("bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8", className)}
    >
      {/*
        No mobile a AppSidebar (única fonte da marca "aurea" / "Portal
        Parceiro") fica escondida — sem BottomNav equivalente, a marca
        desaparecia por completo do app depois do login. md:hidden porque
        no desktop a sidebar já cobre isso.
      */}
      <div className="mb-3 flex items-center gap-1.5 md:hidden">
        <AureaLogoMark size={16} className="text-white" />
        <span className="font-fraunces text-sm font-bold text-white">
          aurea
        </span>
        <span className="text-[10px] tracking-widest text-white/40 uppercase">
          Portal Parceiro
        </span>
      </div>
      <div className="mb-1 flex items-start justify-between md:mb-3">
        <div>
          <h1 className="font-fraunces text-2xl font-bold text-white md:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>
          )}
        </div>
        {onLogout && (
          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy md:hidden"
              aria-label="Sair"
            >
              {getInitials(displayName)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

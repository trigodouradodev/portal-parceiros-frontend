import { Search } from "lucide-react";
import { useAuth } from "@/contexts/auth/auth-context";
import {
  getFirstName,
  getGreeting,
  getInitials,
} from "@/lib/user-display";
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
    <div className={cn("bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8", className)}>
      <div className="mb-1 flex items-start justify-between md:mb-3">
        <div>
          <h1 className="font-fraunces text-2xl font-bold text-white md:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            className="text-white/70 transition-colors hover:text-white"
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy md:hidden"
              aria-label="Sair"
            >
              {getInitials(displayName)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

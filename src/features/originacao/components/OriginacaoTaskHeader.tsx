import { ArrowLeft } from "lucide-react";
import { LogoutAvatarButton } from "@/components/layout/LogoutAvatarButton";
import { useAuth } from "@/contexts/auth/auth-context";
import { OriginacaoProgress } from "@/features/originacao/components/OriginacaoProgress";
import { getInitials } from "@/lib/user-display";

interface OriginacaoTaskHeaderProps {
  title: string;
  subtitle?: string;
  progress?: number;
  backLabel: string;
  onBack: () => void;
  onLogout?: () => void;
}

export function OriginacaoTaskHeader({
  title,
  subtitle,
  progress,
  backLabel,
  onBack,
  onLogout,
}: OriginacaoTaskHeaderProps) {
  const { user } = useAuth();
  const initials = getInitials(user?.full_name ?? "Parceiro");

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-brand-navy px-4 pt-[max(2.75rem,calc(env(safe-area-inset-top)+0.75rem))] pb-3 md:static md:px-8 md:pt-5">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-base font-bold text-white">
              {title}
            </h2>
            {subtitle ? (
              <p className="truncate text-xs text-white/60">{subtitle}</p>
            ) : null}
          </div>
          {onLogout ? (
            <LogoutAvatarButton initials={initials} onLogout={onLogout} />
          ) : null}
        </div>
        {progress != null ? (
          <div className="mt-3">
            <OriginacaoProgress value={progress} tone="onDark" />
          </div>
        ) : null}
      </div>
    </header>
  );
}

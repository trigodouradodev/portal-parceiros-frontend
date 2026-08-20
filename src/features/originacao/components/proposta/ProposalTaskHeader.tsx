import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth/auth-context";
import { OriginacaoProgress } from "@/features/originacao/components/OriginacaoProgress";
import type { SimulacaoSnapshot } from "@/features/originacao/types";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";

interface ProposalTaskHeaderProps {
  title: string;
  simulation: SimulacaoSnapshot;
  progress?: number;
  backLabel: string;
  onBack: () => void;
  onLogout?: () => void;
}

export function ProposalTaskHeader({
  title,
  simulation,
  progress,
  backLabel,
  onBack,
  onLogout,
}: ProposalTaskHeaderProps) {
  const { user } = useAuth();
  const initials = getInitials(user?.full_name ?? "Parceiro");

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-brand-navy px-4 pt-11 pb-3 md:static md:px-8 md:pt-5">
      <div className="mx-auto w-full max-w-2xl">
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
            <h2 className="truncate font-fraunces text-base font-bold text-white">
              {title}
            </h2>
            <p className="truncate text-xs text-white/60">
              {fmtBRL(simulation.valor)} · {simulation.parcelas}x ·{" "}
              {simulation.produto}
            </p>
          </div>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy md:hidden"
              aria-label="Sair"
            >
              {initials}
            </button>
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

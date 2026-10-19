import { useAuth } from "@/contexts/auth/auth-context";
import { getRoleLabel } from "@/lib/user-display";
import type { PerformanceLevel } from "@/services/performance/performance.types";

export function PartnerIdentityBar({ level }: { level?: PerformanceLevel }) {
  const { user } = useAuth();
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <p className="text-xs text-[#697183]">{user?.full_name ?? "Parceiro"}</p>
      {user?.role && (
        <span className="text-xs text-[#697183]">
          · {getRoleLabel(user.role)}
        </span>
      )}
      {level && (
        <span className="rounded-md border border-[#E6D8C5] bg-[#EFE6D8] px-2 py-0.5 text-[10px] font-semibold text-[#755B31]">
          {level.label ? `Nível ${level.label}` : "Nível não informado"}
        </span>
      )}
    </div>
  );
}

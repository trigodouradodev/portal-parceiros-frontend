import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { AureaLogoMark } from "@/components/brand/AureaLogo";
import { type NavTab } from "@/components/layout/nav-config";
import { useAuth } from "@/contexts/auth/auth-context";
import { getInitials, getRoleLabel } from "@/lib/user-display";
import { cn } from "@/lib/utils";

interface NavItem {
  key: NavTab;
  icon: ReactNode;
  label: string;
  path: string;
}

interface AppSidebarProps {
  activeTab: NavTab;
  items: NavItem[];
  onNavigate: (tab: NavTab) => void;
  onRequestLogout: () => void;
  className?: string;
}

export function AppSidebar({
  activeTab,
  items,
  onNavigate,
  onRequestLogout,
  className,
}: AppSidebarProps) {
  const { user } = useAuth();

  const displayName = user?.full_name ?? "Parceiro";
  const roleLabel = getRoleLabel(user?.role);

  return (
    <aside
      className={cn(
        "fixed top-0 bottom-0 left-0 z-20 hidden w-56 flex-col bg-brand-navy md:flex",
        className,
      )}
    >
      <div className="border-b border-white/10 px-6 pt-8 pb-6">
        <div className="flex items-center gap-2">
          <AureaLogoMark />
          <div>
            <p className="font-fraunces text-lg leading-tight font-bold text-white">
              aurea
            </p>
            <p className="text-[10px] tracking-widest text-white/40 uppercase">
              Portal Parceiro
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-white/40">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-3 py-4"
        aria-label="Navegação principal"
      >
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={onRequestLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-all hover:bg-white/5 hover:text-white/70"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}

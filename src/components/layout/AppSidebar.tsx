import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { AureaLogo } from "@/components/brand/AureaLogo";
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
        "fixed top-0 bottom-0 left-0 z-20 hidden w-56 flex-col bg-brand-gray md:flex",
        className,
      )}
    >
      <div className="border-b border-brand-navy/10 px-6 pt-8 pb-6">
        <div className="flex flex-col items-center gap-1.5">
          <AureaLogo size={40} logoClassName="text-brand-navy" />
          <p className="text-[10px] tracking-widest text-brand-navy/50 uppercase">
            Portal Parceiro
          </p>
        </div>
      </div>

      <div className="border-b border-brand-navy/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-yellow">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-navy">
              {displayName}
            </p>
            <p className="truncate text-xs text-brand-navy/50">{roleLabel}</p>
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
                  ? "bg-brand-navy/10 text-brand-navy font-semibold"
                  : "text-brand-navy/50 hover:bg-brand-navy/5 hover:text-brand-navy/80",
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
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-navy/50 transition-all hover:bg-brand-navy/5 hover:text-brand-navy/80"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}

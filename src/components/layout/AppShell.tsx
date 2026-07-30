import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { NAV_ITEMS, type NavTab } from "@/components/layout/nav-config";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/contexts/auth/auth-context";
import { isNotFoundError, usePartnerProfile } from "@/hooks/usePerformanceData";

function pathToNavTab(pathname: string, items: typeof NAV_ITEMS): NavTab {
  const match = items.find(
    (item) =>
      item.path === pathname ||
      (item.path !== "/" && pathname.startsWith(`${item.path}/`)),
  );
  return match?.key ?? "home";
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, authenticated } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const profileQuery = usePartnerProfile({ enabled: authenticated });
  const showDesempenho =
    Boolean(profileQuery.data) &&
    !(profileQuery.isError && isNotFoundError(profileQuery.error));

  const navItems = useMemo(
    () =>
      showDesempenho
        ? NAV_ITEMS
        : NAV_ITEMS.filter((item) => item.key !== "desempenho"),
    [showDesempenho],
  );

  const activeTab = pathToNavTab(location.pathname, navItems);

  const handleNavigate = (tab: NavTab) => {
    const item = navItems.find((nav) => nav.key === tab);
    if (item) {
      navigate(item.path);
    }
  };

  const handleRequestLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background font-sans md:flex">
      <AppSidebar
        activeTab={activeTab}
        items={navItems}
        onNavigate={handleNavigate}
        onRequestLogout={handleRequestLogout}
      />

      <div className="flex w-full min-w-0 flex-1 flex-col md:ml-56">
        <Outlet context={{ onMobileLogout: handleRequestLogout }} />
      </div>

      <BottomNav
        activeTab={activeTab}
        items={navItems}
        onNavigate={handleNavigate}
      />

      <ConfirmDialog
        open={confirmLogoutOpen}
        onOpenChange={setConfirmLogoutOpen}
        title="Deseja sair?"
        description="Você precisará entrar novamente para acessar o portal."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmLogout}
        destructive
      />
    </div>
  );
}

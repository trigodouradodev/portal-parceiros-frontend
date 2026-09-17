import { Briefcase, Home, User, UserCheck } from "lucide-react";
import { hasPermission, PORTAL_PERMISSIONS } from "@/lib/permissions";

export type NavTab =
  | "home"
  | "carteira"
  | "originacao"
  | "desempenho"
  | "perfil";

export const NAV_ITEMS: {
  key: NavTab;
  icon: React.ReactNode;
  label: string;
  path: string;
}[] = [
  { key: "home", icon: <Home size={20} />, label: "Home", path: "/" },
  {
    key: "carteira",
    icon: <Briefcase size={20} />,
    label: "Carteira",
    path: "/carteira",
  },
  {
    key: "originacao",
    icon: <UserCheck size={20} />,
    label: "Originação",
    path: "/originacao",
  },
  // O módulo de desempenho está temporariamente fora da navegação enquanto
  // passa por revisão técnica da área de produto.
  {
    key: "perfil",
    icon: <User size={20} />,
    label: "Perfil",
    path: "/profile",
  },
];

export function getNavItemsForPermissions(permissions?: readonly string[]) {
  const isCollectionAgent = hasPermission(
    permissions,
    PORTAL_PERMISSIONS.ROLE_COLLECTION_AGENT,
  );
  const hasNewOriginationFlow = hasPermission(
    permissions,
    PORTAL_PERMISSIONS.QUOTE_NEW_ORIGINATION_FLOW,
  );

  return NAV_ITEMS.filter((item) => {
    if (item.key === "carteira" && isCollectionAgent) return false;
    if (item.key === "originacao" && !hasNewOriginationFlow) return false;
    return true;
  });
}

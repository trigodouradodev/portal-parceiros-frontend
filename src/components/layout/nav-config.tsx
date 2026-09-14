import { Briefcase, Home, User, UserCheck } from "lucide-react";

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
  if (!permissions?.includes("ROLE_COLLECTION_AGENT")) return NAV_ITEMS;

  return NAV_ITEMS.filter((item) => item.key !== "carteira");
}

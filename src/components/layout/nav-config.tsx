import { BarChart2, Home, User } from "lucide-react";

export type NavTab = "home" | "desempenho" | "perfil";

export const NAV_ITEMS: {
  key: NavTab;
  icon: React.ReactNode;
  label: string;
  path: string;
}[] = [
  { key: "home", icon: <Home size={20} />, label: "Home", path: "/" },
  {
    key: "desempenho",
    icon: <BarChart2 size={20} />,
    label: "Desempenho",
    path: "/performance",
  },
  {
    key: "perfil",
    icon: <User size={20} />,
    label: "Perfil",
    path: "/profile",
  },
];

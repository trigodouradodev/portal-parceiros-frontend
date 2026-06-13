import {
  Home,
  Briefcase,
  BarChart2,
  User,
} from "lucide-react";

export type NavTab = "home" | "carteira" | "visao" | "perfil";

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
  { key: "visao", icon: <BarChart2 size={20} />, label: "Visão", path: "/visao" },
  { key: "perfil", icon: <User size={20} />, label: "Perfil", path: "/perfil" },
];

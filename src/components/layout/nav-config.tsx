import { BarChart2, Briefcase, Home, User } from "lucide-react";
// import { UserCheck } from "lucide-react";

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
  // {
  //   key: "originacao",
  //   icon: <UserCheck size={20} />,
  //   label: "Originação",
  //   path: "/originacao",
  // },
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

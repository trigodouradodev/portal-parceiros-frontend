import { Home, User } from "lucide-react";

export type NavTab = "home" | "profile";

export const NAV_ITEMS: {
  key: NavTab;
  icon: React.ReactNode;
  label: string;
  path: string;
}[] = [
  { key: "home", icon: <Home size={20} />, label: "Home", path: "/" },
  { key: "profile", icon: <User size={20} />, label: "Perfil", path: "/profile" },
];

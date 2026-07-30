import { type NavTab } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

interface NavItem {
  key: NavTab;
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface BottomNavProps {
  activeTab: NavTab;
  items: NavItem[];
  onNavigate: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, items, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-10 flex border-t border-[#E2E4EC] bg-white md:hidden">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onNavigate(item.key)}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors",
            activeTab === item.key ? "text-brand-navy" : "text-[#9DA3B4]",
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

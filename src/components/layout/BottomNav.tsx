import { NAV_ITEMS, type NavTab } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-border bg-white md:hidden">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onNavigate(item.key)}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors",
            activeTab === item.key
              ? "text-brand-navy"
              : "text-muted-foreground/70",
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

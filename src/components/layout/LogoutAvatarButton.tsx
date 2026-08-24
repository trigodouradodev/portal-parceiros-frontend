import { cn } from "@/lib/utils";

const toneClassName = {
  onNavy: "bg-brand-yellow text-brand-navy",
  onYellow: "bg-brand-navy text-brand-yellow",
} as const;

interface LogoutAvatarButtonProps {
  initials: string;
  onLogout: () => void;
  /** `onNavy` no header navy da originação; `onYellow` no PageHeader amarelo. */
  tone?: keyof typeof toneClassName;
  className?: string;
}

export function LogoutAvatarButton({
  initials,
  onLogout,
  tone = "onNavy",
  className,
}: LogoutAvatarButtonProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold md:hidden",
        toneClassName[tone],
        className,
      )}
      aria-label="Sair"
    >
      {initials}
    </button>
  );
}

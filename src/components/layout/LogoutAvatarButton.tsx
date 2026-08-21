import { cn } from "@/lib/utils";

interface LogoutAvatarButtonProps {
  initials: string;
  onLogout: () => void;
  className?: string;
}

export function LogoutAvatarButton({
  initials,
  onLogout,
  className,
}: LogoutAvatarButtonProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy md:hidden",
        className,
      )}
      aria-label="Sair"
    >
      {initials}
    </button>
  );
}

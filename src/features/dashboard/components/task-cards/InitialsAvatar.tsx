import { cn } from "@/lib/utils";

interface InitialsAvatarProps {
  initials: string;
  size?: "sm" | "md";
  variant?: "brand" | "muted";
  className?: string;
}

const sizeClass = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-sm",
} as const;

const variantClass = {
  brand: "bg-brand-yellow text-brand-navy",
  muted: "bg-[#F0F1F5] text-[#9DA3B4]",
} as const;

export function InitialsAvatar({
  initials,
  size = "md",
  variant = "brand",
  className,
}: InitialsAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        sizeClass[size],
        variantClass[variant],
        className,
      )}
    >
      {initials}
    </div>
  );
}

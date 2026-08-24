import { getInitials } from "@/lib/user-display";

interface ProfileAvatarHeaderProps {
  displayName: string;
  roleLabel: string;
}

export function ProfileAvatarHeader({
  displayName,
  roleLabel,
}: ProfileAvatarHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xl font-bold text-brand-navy">
        {getInitials(displayName)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-fraunces text-xl font-bold text-[#1A1D2E]">
          {displayName}
        </p>
        <p className="text-sm text-[#9DA3B4]">{roleLabel}</p>
      </div>
    </div>
  );
}

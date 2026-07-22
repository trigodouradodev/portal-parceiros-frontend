import { Camera } from "lucide-react";
import { getInitials } from "@/lib/user-display";

interface ProfileAvatarHeaderProps {
  displayName: string;
  roleLabel: string;
  onCameraClick: () => void;
}

export function ProfileAvatarHeader({
  displayName,
  roleLabel,
  onCameraClick,
}: ProfileAvatarHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="relative">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xl font-bold text-brand-navy">
          {getInitials(displayName)}
        </div>
        <button
          type="button"
          className="absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-white transition-colors hover:bg-brand-navy/80"
          aria-label="Alterar foto"
          onClick={onCameraClick}
        >
          <Camera size={12} />
        </button>
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

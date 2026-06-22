import { Navigation } from "lucide-react";

interface IdleStatusProps {
  onVerifyLocation: () => void;
}

export function IdleStatus({ onVerifyLocation }: IdleStatusProps) {
  return (
    <button
      type="button"
      onClick={onVerifyLocation}
      className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-4 font-semibold text-white transition-colors hover:bg-brand-navy/90"
    >
      <Navigation size={18} />
      Verificar minha localização
    </button>
  );
}

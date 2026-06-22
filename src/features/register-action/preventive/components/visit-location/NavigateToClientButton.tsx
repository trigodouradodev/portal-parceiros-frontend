import { ExternalLink, Navigation } from "lucide-react";
import { hasValidAddress, openMapsNavigation } from "@/lib/contact-actions";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";

interface NavigateToClientButtonProps {
  address?: ClientAddress;
  destinationCoordinates?: { latitude: number; longitude: number };
}

export function NavigateToClientButton({
  address,
  destinationCoordinates,
}: NavigateToClientButtonProps) {
  const navigable =
    hasValidAddress(address) || destinationCoordinates !== undefined;

  return (
    <button
      type="button"
      disabled={!navigable}
      onClick={() => openMapsNavigation(address, destinationCoordinates)}
      className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-3.5 font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Navigation size={18} />
      Ir até o cliente (GPS)
      <ExternalLink size={14} className="opacity-70" />
    </button>
  );
}

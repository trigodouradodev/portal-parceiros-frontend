import { ExternalLink, Navigation } from "lucide-react";
import { hasValidAddress, openMapsNavigation } from "@/lib/contact-actions";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";

interface NavigateToAddressButtonProps {
  address?: ClientAddress;
  destinationCoordinates?: { latitude: number; longitude: number };
  /** primary = CTA navy; secondary = outline mais discreto. */
  variant?: "primary" | "secondary";
}

export function NavigateToAddressButton({
  address,
  destinationCoordinates,
  variant = "primary",
}: NavigateToAddressButtonProps) {
  const navigable =
    hasValidAddress(address) || destinationCoordinates !== undefined;

  const className =
    variant === "secondary"
      ? "flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-background py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      : "flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-3.5 font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button
      type="button"
      disabled={!navigable}
      onClick={() => openMapsNavigation(address, destinationCoordinates)}
      className={className}
    >
      <Navigation size={18} />
      Ir até o endereço
      <ExternalLink size={14} className="opacity-70" />
    </button>
  );
}

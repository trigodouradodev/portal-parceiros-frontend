import { MapPin } from "lucide-react";
import { formatClientAddress, hasValidAddress } from "@/lib/contact-actions";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";

interface ClientAddressCardProps {
  address?: ClientAddress;
  label?: string;
}

export function ClientAddressCard({
  address,
  label = "Endereço do cliente",
}: ClientAddressCardProps) {
  const hasAddress = hasValidAddress(address);
  let displayAddress = "Endereço não cadastrado";
  if (hasAddress && address) {
    displayAddress = formatClientAddress(address);
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted p-4">
      <MapPin size={18} className="mt-0.5 shrink-0 text-brand-navy" />
      <div>
        <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          {displayAddress}
        </p>
      </div>
    </div>
  );
}

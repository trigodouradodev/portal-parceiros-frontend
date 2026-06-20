import { MapPin } from "lucide-react";
import { formatClientAddress, hasValidAddress } from "@/lib/contact-actions";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";

interface ClientAddressCardProps {
  address?: ClientAddress;
}

export function ClientAddressCard({ address }: ClientAddressCardProps) {
  const hasAddress = hasValidAddress(address);
  const formattedAddress = hasAddress ? formatClientAddress(address!) : null;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-background p-4">
      <MapPin size={18} className="mt-0.5 shrink-0 text-brand-navy" />
      <div>
        <p className="mb-0.5 text-xs text-muted-foreground">
          Endereço do cliente
        </p>
        <p className="text-sm font-semibold text-foreground">
          {formattedAddress ?? "Endereço não cadastrado"}
        </p>
      </div>
    </div>
  );
}

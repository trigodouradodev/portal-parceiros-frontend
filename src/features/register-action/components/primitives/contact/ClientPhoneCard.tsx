import { Phone } from "lucide-react";
import { hasCallablePhone } from "@/lib/contact-actions";

interface ClientPhoneCardProps {
  phone: string;
  label?: string;
  truncate?: boolean;
}

export function ClientPhoneCard({
  phone,
  label = "Telefone cadastrado",
  truncate = false,
}: ClientPhoneCardProps) {
  const callable = hasCallablePhone(phone);
  const displayPhone = callable ? phone : "Telefone não disponível";
  const valueClassName = truncate
    ? "font-mono-dm truncate text-base font-bold text-foreground"
    : "font-mono-dm text-base font-bold text-foreground";
  const contentClassName = truncate ? "min-w-0 flex-1" : undefined;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-muted p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy">
        <Phone size={20} className="text-white" />
      </div>
      <div className={contentClassName}>
        <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
        <p className={valueClassName}>{displayPhone}</p>
      </div>
    </div>
  );
}

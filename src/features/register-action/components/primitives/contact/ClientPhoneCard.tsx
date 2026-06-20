import { Phone } from "lucide-react";
import { hasCallablePhone } from "@/lib/contact-actions";

interface ClientPhoneCardProps {
  phone: string;
  truncate?: boolean;
}

export function ClientPhoneCard({
  phone,
  truncate = false,
}: ClientPhoneCardProps) {
  const callable = hasCallablePhone(phone);

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-background p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy">
        <Phone size={20} className="text-white" />
      </div>
      <div className={truncate ? "min-w-0 flex-1" : undefined}>
        <p className="mb-0.5 text-xs text-muted-foreground">
          Telefone cadastrado
        </p>
        <p
          className={`font-mono-dm text-base font-bold text-foreground${
            truncate ? " truncate" : ""
          }`}
        >
          {callable ? phone : "Telefone não disponível"}
        </p>
      </div>
    </div>
  );
}

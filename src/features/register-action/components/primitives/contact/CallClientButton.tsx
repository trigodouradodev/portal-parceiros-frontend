import { ExternalLink, Phone } from "lucide-react";
import { hasCallablePhone, openPhoneCall } from "@/lib/contact-actions";

interface CallClientButtonProps {
  phone: string;
  clientFirstName?: string;
  size: "sm" | "lg";
}

export function CallClientButton({
  phone,
  clientFirstName,
  size,
}: CallClientButtonProps) {
  const callable = hasCallablePhone(phone);
  const isLarge = size === "lg";

  return (
    <button
      type="button"
      disabled={!callable}
      className={`flex items-center justify-center gap-2 rounded-2xl bg-brand-navy font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50 ${
        isLarge ? "w-full gap-2.5 py-4 text-base" : "flex-1 gap-2 py-3 text-sm"
      }`}
      onClick={() => openPhoneCall(phone)}
    >
      <Phone size={isLarge ? 20 : 16} />
      {isLarge && clientFirstName
        ? `Ligar agora para ${clientFirstName}`
        : "Ligar"}
      <ExternalLink size={isLarge ? 14 : 12} className="opacity-70" />
    </button>
  );
}

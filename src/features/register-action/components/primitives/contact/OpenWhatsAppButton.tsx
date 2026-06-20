import { ExternalLink, MessageSquare } from "lucide-react";
import { hasCallablePhone, openWhatsApp } from "@/lib/contact-actions";

interface OpenWhatsAppButtonProps {
  phone: string;
  message?: string;
  size: "sm" | "lg";
}

export function OpenWhatsAppButton({
  phone,
  message,
  size,
}: OpenWhatsAppButtonProps) {
  const callable = hasCallablePhone(phone);
  const isLarge = size === "lg";

  return (
    <button
      type="button"
      disabled={!callable}
      className={`flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] font-semibold text-white transition-colors hover:bg-[#1ebe5a] disabled:cursor-not-allowed disabled:opacity-50 ${
        isLarge ? "w-full gap-2.5 py-3.5" : "flex-1 gap-2 py-3 text-sm"
      }`}
      onClick={() => openWhatsApp(phone, message)}
    >
      <MessageSquare size={isLarge ? 18 : 16} />
      {isLarge ? "Abrir WhatsApp com esta mensagem" : "WhatsApp"}
      <ExternalLink size={isLarge ? 14 : 12} className="opacity-70" />
    </button>
  );
}

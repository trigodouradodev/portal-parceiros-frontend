import { WhatsAppButton } from "@/components/ui/whatsapp-button";
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
    <WhatsAppButton
      disabled={!callable}
      size={isLarge ? "pill" : undefined}
      className={isLarge ? "w-full py-3.5" : "h-auto flex-1 py-3 text-sm"}
      showExternalIcon
      onClick={() => openWhatsApp(phone, message)}
    >
      {isLarge ? "Abrir WhatsApp com esta mensagem" : "WhatsApp"}
    </WhatsAppButton>
  );
}

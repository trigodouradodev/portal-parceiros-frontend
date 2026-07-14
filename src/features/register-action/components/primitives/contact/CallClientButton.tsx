import { ExternalLink, Phone } from "lucide-react";
import { hasCallablePhone, openPhoneCall } from "@/lib/contact-actions";

interface CallClientButtonProps {
  phone: string;
  clientFirstName?: string;
  size: "sm" | "lg";
}

function getCallButtonLabel(
  size: "sm" | "lg",
  clientFirstName?: string,
): string {
  if (size === "lg" && clientFirstName) {
    return `Ligar agora para ${clientFirstName}`;
  }
  return "Ligar";
}

export function CallClientButton({
  phone,
  clientFirstName,
  size,
}: CallClientButtonProps) {
  const callable = hasCallablePhone(phone);
  const isLarge = size === "lg";
  const iconSize = isLarge ? 20 : 16;
  const externalIconSize = isLarge ? 14 : 12;
  const label = getCallButtonLabel(size, clientFirstName);
  const buttonClassName = isLarge
    ? "flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-4 text-base font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
    : "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button
      type="button"
      disabled={!callable}
      className={buttonClassName}
      onClick={() => openPhoneCall(phone)}
    >
      <Phone size={iconSize} />
      {label}
      <ExternalLink size={externalIconSize} className="opacity-70" />
    </button>
  );
}

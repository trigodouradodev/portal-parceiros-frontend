import { ExternalLink, MessageSquare } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const whatsappButtonClassName =
  "bg-[#25D366] text-white hover:bg-[#1ebe5a]";

export function WhatsAppButton({
  className,
  children,
  showExternalIcon,
  ...props
}: ButtonProps & { showExternalIcon?: boolean }) {
  return (
    <Button
      type="button"
      className={cn(
        "gap-2.5 font-semibold",
        whatsappButtonClassName,
        className,
      )}
      {...props}
    >
      <MessageSquare />
      {children}
      {showExternalIcon ? (
        <ExternalLink size={14} className="opacity-70" />
      ) : null}
    </Button>
  );
}

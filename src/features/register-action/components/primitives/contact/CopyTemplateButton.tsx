import { CheckCircle2, Copy } from "lucide-react";

interface CopyTemplateButtonProps {
  copied: boolean;
  onClick: () => void;
  className?: string;
}

export function CopyTemplateButton({
  copied,
  onClick,
  className = "flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-brand-navy",
}: CopyTemplateButtonProps) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {copied ? (
        <>
          <CheckCircle2 size={12} className="text-success" />
          <span className="text-success">Copiado!</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          Copiar
        </>
      )}
    </button>
  );
}

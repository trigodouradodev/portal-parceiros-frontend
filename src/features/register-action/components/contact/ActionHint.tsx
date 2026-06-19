export type ActionHintVariant = "call" | "whatsapp" | "visit-confirmed";

const HINT_MESSAGES: Record<ActionHintVariant, string> = {
  call: "Após a ligação, avance para registrar o resultado.",
  whatsapp: "Após enviar, avance para registrar o resultado.",
  "visit-confirmed": "Avance para registrar o resultado da visita.",
};

interface ActionHintProps {
  variant: ActionHintVariant;
}

export function ActionHint({ variant }: ActionHintProps) {
  return (
    <p className="text-center text-xs text-muted-foreground">
      {HINT_MESSAGES[variant]}
    </p>
  );
}

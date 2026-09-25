import { Loader2 } from "lucide-react";

interface CheckingStatusProps {
  /** Fase atual: localizando (GPS) ou verificando (API). */
  phase?: "locating" | "checking";
}

export function CheckingStatus({ phase = "checking" }: CheckingStatusProps) {
  const label =
    phase === "locating" ? "Localizando…" : "Verificando localização…";

  return (
    <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-muted py-4 font-semibold text-muted-foreground">
      <Loader2 size={18} className="animate-spin" />
      {label}
    </div>
  );
}

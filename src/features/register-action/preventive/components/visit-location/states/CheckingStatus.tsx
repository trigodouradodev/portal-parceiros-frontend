import { Loader2 } from "lucide-react";

export function CheckingStatus() {
  return (
    <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-muted py-4 font-semibold text-muted-foreground">
      <Loader2 size={18} className="animate-spin" />
      Verificando localização…
    </div>
  );
}

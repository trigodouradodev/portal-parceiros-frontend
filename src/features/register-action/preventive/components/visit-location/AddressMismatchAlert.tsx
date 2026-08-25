import { AlertTriangle } from "lucide-react";

/**
 * AUREA-352: quando o geocoding do endereço não é confiável (locationType
 * != ROOFTOP, ou o texto nem cita a cidade certa), a distância calculada
 * pode estar errada por vários km — por isso não é exibida nesse caso (ver
 * NotFoundStatus). Esse aviso explica o motivo sem números que podem ser
 * falsos.
 */
export function AddressMismatchAlert() {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
      <p className="text-xs text-muted-foreground">
        Não conseguimos confirmar com precisão a localização desse endereço —
        pode ser um problema no cadastro ou na geolocalização, não
        necessariamente na sua posição. Se você tem certeza de que está no
        endereço certo, confirme manualmente.
      </p>
    </div>
  );
}

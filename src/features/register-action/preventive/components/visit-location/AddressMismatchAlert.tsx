import { AlertTriangle } from "lucide-react";

/**
 * AUREA-352: quando o endereço formatado devolvido pelo geocoding não cita a
 * cidade cadastrada, a distância mostrada não é confiável — o problema é
 * provavelmente o cadastro do endereço, não a localização do parceiro.
 */
export function AddressMismatchAlert() {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
      <p className="text-xs text-muted-foreground">
        O endereço cadastrado pode estar incorreto ou impreciso — a distância
        mostrada pode não refletir sua localização real. Se você tem certeza de
        que está no endereço certo, confirme manualmente.
      </p>
    </div>
  );
}

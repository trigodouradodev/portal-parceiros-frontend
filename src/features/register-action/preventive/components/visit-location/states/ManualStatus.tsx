import { CheckCircle2 } from "lucide-react";
import { ActionHint } from "@/features/register-action/components/primitives/contact/ActionHint";

export function ManualStatus() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-yellow/20 py-4 font-semibold text-brand-navy">
        <CheckCircle2 size={18} />
        Presença confirmada manualmente
      </div>
      <ActionHint variant="visit-confirmed" />
    </div>
  );
}

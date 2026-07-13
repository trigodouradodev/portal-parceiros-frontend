import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

interface PromiseDateSummaryProps {
  date: Date;
  onChange: () => void;
}

export function PromiseDateSummary({
  date,
  onChange,
}: PromiseDateSummaryProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-success bg-success-bg p-3.5">
      <div className="flex items-center gap-2.5">
        <CalendarDays size={18} className="shrink-0 text-success" />
        <div>
          <p className="text-xs text-success">Data prometida para pagamento</p>
          <p className="text-sm font-semibold text-success">
            {format(date, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-xs font-semibold text-success underline"
      >
        Alterar
      </button>
    </div>
  );
}

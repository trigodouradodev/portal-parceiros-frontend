import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Eye,
  EyeOff,
  Mail,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "@/components/ui/calendar-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import { OriginacaoFieldInput } from "@/features/originacao/components/OriginacaoFieldInput";
import {
  AMOUNT_DEFAULT,
  AMOUNT_MAX,
  AMOUNT_MIN,
  AMOUNT_STEP,
  FIRST_INSTALLMENT_MAX_DAYS,
  INSTALLMENT_OPTIONS,
  isAllowedDueDate,
  PRODUCT_RATE,
  PRODUCTS,
  type SimulationProduct,
} from "@/features/originacao/data/simulacao";
import type {
  DadosElegibilidade,
  SimulacaoSnapshot,
} from "@/features/originacao/types";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import { formatPhone } from "@/features/originacao/utils/format-phone";
import { calcInstallment, fmtBRL } from "@/lib/utils";

interface SimulacaoFormProps {
  prefill: DadosElegibilidade | null;
  hasList: boolean;
  onViewList: () => void;
  onCompleted: (snapshot: SimulacaoSnapshot) => void;
}

export function SimulacaoForm({
  prefill,
  hasList,
  onViewList,
  onCompleted,
}: SimulacaoFormProps) {
  const [nome, setNome] = useState(prefill?.nome ?? "");
  const [nascimento, setNascimento] = useState(prefill?.nascimento ?? "");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [product, setProduct] = useState<SimulationProduct>("Pessoal");
  const [changingProduct, setChangingProduct] = useState(false);
  const [cpf, setCpf] = useState(prefill?.cpf ?? "");
  const [amount, setAmount] = useState(AMOUNT_DEFAULT);
  const [installments, setInstallments] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [draftDueDate, setDraftDueDate] = useState<Date | undefined>(undefined);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [showRate, setShowRate] = useState(false);

  const today = new Date();
  const dueDateLimit = addDays(today, FIRST_INSTALLMENT_MAX_DAYS);
  const dueDay = dueDate?.getDate() ?? null;
  const rate = PRODUCT_RATE[product];
  const installmentAmount = installments
    ? calcInstallment(amount, installments, rate)
    : 0;

  const canSubmit =
    nome.trim() !== "" &&
    nascimento.trim() !== "" &&
    email.trim() !== "" &&
    celular.trim() !== "" &&
    cpf.trim() !== "" &&
    installments !== null &&
    dueDay !== null;

  function openDueDateDialog() {
    setDraftDueDate(dueDate ?? undefined);
    setDueDateDialogOpen(true);
  }

  function confirmDueDate() {
    if (!draftDueDate) return;
    setDueDate(draftDueDate);
    setDueDateDialogOpen(false);
  }

  function handleContinue() {
    if (!canSubmit || installments === null || dueDay === null) return;
    onCompleted({
      id: crypto.randomUUID(),
      criadaEm: new Date().toLocaleString("pt-BR"),
      nome,
      nascimento,
      email,
      celular,
      produto: product,
      taxa: rate,
      cpf,
      valor: amount,
      parcelas: installments,
      vencimento: dueDay,
      parcelaCalc: installmentAmount,
    });
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <div className="mb-6">
        <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
          Simulação
        </h2>
        <p className="mt-1 text-sm text-[#6B7080]">
          Simule uma cotação de crédito para o cliente.
        </p>
        {hasList ? (
          <button
            type="button"
            onClick={onViewList}
            className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand-navy"
          >
            <ArrowLeft size={14} />
            Ver lista de simulações
          </button>
        ) : null}
      </div>

      <section className="rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <OriginacaoFieldInput
            label="Nome completo"
            value={nome}
            onChange={setNome}
            icon={<User size={16} />}
            placeholder="Nome do cliente"
          />
          <OriginacaoFieldInput
            label="CPF"
            value={cpf}
            onChange={(v) => setCpf(formatCpf(v))}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
          />
          <OriginacaoFieldInput
            label="Data de nascimento"
            value={nascimento}
            onChange={setNascimento}
            icon={<User size={16} />}
            type="date"
          />
          <OriginacaoFieldInput
            label="E-mail"
            value={email}
            onChange={setEmail}
            icon={<Mail size={16} />}
            placeholder="cliente@email.com"
            type="email"
          />
          <OriginacaoFieldInput
            label="Celular"
            value={celular}
            onChange={(v) => setCelular(formatPhone(v))}
            icon={<Phone size={16} />}
            placeholder="(11) 99999-0000"
            inputMode="tel"
            maxLength={15}
          />

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Produto
            </Label>
            {!changingProduct ? (
              <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#F5F6FA] px-4 py-3">
                <div>
                  <span className="mb-1 inline-block rounded-full bg-[#FDF3E0] px-2 py-0.5 text-[11px] font-semibold text-[#854F0B]">
                    Sugerido
                  </span>
                  <p className="font-semibold text-[#1A1D2E]">{product}</p>
                  <button
                    type="button"
                    onClick={() => setShowRate((v) => !v)}
                    className="flex items-center gap-1 text-xs text-[#6B7080]"
                  >
                    {showRate ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showRate
                      ? `Taxa de ${rate.toFixed(2).replace(".", ",")}% ao mês · definida pelo produto`
                      : "Mostrar taxa"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setChangingProduct(true)}
                  className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-navy"
                >
                  <RefreshCw size={13} />
                  Trocar
                </button>
              </div>
            ) : (
              <Select
                value={product}
                onValueChange={(v) => {
                  setProduct(v as SimulationProduct);
                  setChangingProduct(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Quanto o cliente precisa?
            </Label>
            <p className="font-fraunces text-3xl font-bold text-brand-navy">
              {fmtBRL(amount)}
            </p>
            <input
              type="range"
              min={AMOUNT_MIN}
              max={AMOUNT_MAX}
              step={AMOUNT_STEP}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-brand-navy"
            />
            <div className="flex justify-between text-xs text-[#9DA3B4]">
              <span>R$ 500</span>
              <span>R$ 30.000</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Em quantas parcelas?
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {INSTALLMENT_OPTIONS.map((n) => (
                <ChipButton
                  key={n}
                  active={installments === n}
                  onClick={() => setInstallments(n)}
                >
                  {n}x
                </ChipButton>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Melhor dia de vencimento
            </Label>
            <p className="text-xs text-[#9DA3B4]">
              Vencimento sempre no dia 5, 10, 15 ou 20, dentro de uma janela de
              até {FIRST_INSTALLMENT_MAX_DAYS} dias (D+
              {FIRST_INSTALLMENT_MAX_DAYS}) a partir de hoje.
            </p>
            <button
              type="button"
              onClick={openDueDateDialog}
              className="flex items-center gap-2 rounded-2xl bg-[#F5F6FA] px-4 py-3 text-left transition-colors hover:bg-[#EFF0F5]"
            >
              <CalendarDays size={16} className="shrink-0 text-[#6B7080]" />
              <span
                className={
                  dueDate ? "font-semibold text-[#1A1D2E]" : "text-[#9DA3B4]"
                }
              >
                {dueDate
                  ? dueDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Selecionar data"}
              </span>
            </button>
          </div>

          {installments !== null && dueDay !== null ? (
            <div className="rounded-2xl bg-[#F5F6FA] px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#6B7080]">Parcela</span>
                <span className="font-fraunces text-xl font-bold text-[#1A1D2E]">
                  {fmtBRL(installmentAmount)}/mês
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          variant="yellow"
          className="mt-5 h-11 w-full rounded-2xl"
          disabled={!canSubmit}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </section>

      <Dialog open={dueDateDialogOpen} onOpenChange={setDueDateDialogOpen}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Selecionar o dia de vencimento</DialogTitle>
            <DialogDescription>
              Sempre no dia 5, 10, 15 ou 20, dentro de uma janela de até{" "}
              {FIRST_INSTALLMENT_MAX_DAYS} dias a partir de hoje.
            </DialogDescription>
          </DialogHeader>
          <Calendar
            selected={draftDueDate}
            minDate={today}
            maxDate={dueDateLimit}
            isDayAllowed={isAllowedDueDate}
            onSelect={setDraftDueDate}
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setDueDateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="h-10 rounded-xl font-semibold"
              disabled={!draftDueDate}
              onClick={confirmDueDate}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

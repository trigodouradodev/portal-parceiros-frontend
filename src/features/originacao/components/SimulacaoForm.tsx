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
import { addDays } from "@/components/ui/calendar-utils";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import { OriginacaoFieldInput } from "@/features/originacao/components/OriginacaoFieldInput";
import {
  ehDiaVencimentoPermitido,
  LIMITE_DIAS_PRIMEIRA_PARCELA,
  PARCELAS_OPCOES,
  PRODUTOS,
  TAXA_PRODUTO,
  VALOR_MAX,
  VALOR_MIN,
  VALOR_PADRAO,
  VALOR_STEP,
  type ProdutoSimulacao,
} from "@/features/originacao/data/simulacao";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import { formatPhone } from "@/features/originacao/utils/format-phone";
import { calcParcela, fmtBRL } from "@/lib/utils";
import type {
  DadosElegibilidade,
  SimulacaoSnapshot,
} from "@/features/originacao/types";

interface SimulacaoFormProps {
  prefill: DadosElegibilidade | null;
  hasLista: boolean;
  onVerLista: () => void;
  onConcluida: (snapshot: SimulacaoSnapshot) => void;
}

export function SimulacaoForm({
  prefill,
  hasLista,
  onVerLista,
  onConcluida,
}: SimulacaoFormProps) {
  const [nome, setNome] = useState(prefill?.nome ?? "");
  const [nascimento, setNascimento] = useState(prefill?.nascimento ?? "");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [produto, setProduto] = useState<ProdutoSimulacao>("Pessoal");
  const [trocandoProduto, setTrocandoProduto] = useState(false);
  const [cpf, setCpf] = useState(prefill?.cpf ?? "");
  const [valor, setValor] = useState(VALOR_PADRAO);
  const [parcelas, setParcelas] = useState<number | null>(null);
  const [vencimentoData, setVencimentoData] = useState<Date | null>(null);
  const [draftVencimentoData, setDraftVencimentoData] = useState<
    Date | undefined
  >(undefined);
  const [vencimentoDialogOpen, setVencimentoDialogOpen] = useState(false);
  const [mostrarTaxa, setMostrarTaxa] = useState(false);

  const hoje = new Date();
  const limiteVencimento = addDays(hoje, LIMITE_DIAS_PRIMEIRA_PARCELA);
  const vencimento = vencimentoData?.getDate() ?? null;
  const taxa = TAXA_PRODUTO[produto];
  const parcelaCalc = parcelas ? calcParcela(valor, parcelas, taxa) : 0;

  const canSubmit =
    nome.trim() !== "" &&
    nascimento.trim() !== "" &&
    email.trim() !== "" &&
    celular.trim() !== "" &&
    cpf.trim() !== "" &&
    parcelas !== null &&
    vencimento !== null;

  function abrirDialogVencimento() {
    setDraftVencimentoData(vencimentoData ?? undefined);
    setVencimentoDialogOpen(true);
  }

  function confirmarVencimento() {
    if (!draftVencimentoData) return;
    setVencimentoData(draftVencimentoData);
    setVencimentoDialogOpen(false);
  }

  function handleContinuar() {
    if (!canSubmit || parcelas === null || vencimento === null) return;
    onConcluida({
      id: crypto.randomUUID(),
      criadaEm: new Date().toLocaleString("pt-BR"),
      nome,
      nascimento,
      email,
      celular,
      produto,
      taxa,
      cpf,
      valor,
      parcelas,
      vencimento,
      parcelaCalc,
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
        {hasLista ? (
          <button
            type="button"
            onClick={onVerLista}
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
            {!trocandoProduto ? (
              <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#F5F6FA] px-4 py-3">
                <div>
                  <span className="mb-1 inline-block rounded-full bg-[#FDF3E0] px-2 py-0.5 text-[11px] font-semibold text-[#854F0B]">
                    Sugerido
                  </span>
                  <p className="font-semibold text-[#1A1D2E]">{produto}</p>
                  <button
                    type="button"
                    onClick={() => setMostrarTaxa((v) => !v)}
                    className="flex items-center gap-1 text-xs text-[#6B7080]"
                  >
                    {mostrarTaxa ? <EyeOff size={12} /> : <Eye size={12} />}
                    {mostrarTaxa
                      ? `Taxa de ${taxa.toFixed(2).replace(".", ",")}% ao mês · definida pelo produto`
                      : "Mostrar taxa"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setTrocandoProduto(true)}
                  className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-navy"
                >
                  <RefreshCw size={13} />
                  Trocar
                </button>
              </div>
            ) : (
              <Select
                value={produto}
                onValueChange={(v) => {
                  setProduto(v as ProdutoSimulacao);
                  setTrocandoProduto(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUTOS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
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
              {fmtBRL(valor)}
            </p>
            <input
              type="range"
              min={VALOR_MIN}
              max={VALOR_MAX}
              step={VALOR_STEP}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
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
              {PARCELAS_OPCOES.map((n) => (
                <ChipButton
                  key={n}
                  active={parcelas === n}
                  onClick={() => setParcelas(n)}
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
              até {LIMITE_DIAS_PRIMEIRA_PARCELA} dias (D+
              {LIMITE_DIAS_PRIMEIRA_PARCELA}) a partir de hoje.
            </p>
            <button
              type="button"
              onClick={abrirDialogVencimento}
              className="flex items-center gap-2 rounded-2xl bg-[#F5F6FA] px-4 py-3 text-left transition-colors hover:bg-[#EFF0F5]"
            >
              <CalendarDays size={16} className="shrink-0 text-[#6B7080]" />
              <span
                className={
                  vencimentoData
                    ? "font-semibold text-[#1A1D2E]"
                    : "text-[#9DA3B4]"
                }
              >
                {vencimentoData
                  ? vencimentoData.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Selecionar data"}
              </span>
            </button>
          </div>

          {parcelas !== null && vencimento !== null ? (
            <div className="rounded-2xl bg-[#F5F6FA] px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#6B7080]">Parcela</span>
                <span className="font-fraunces text-xl font-bold text-[#1A1D2E]">
                  {fmtBRL(parcelaCalc)}/mês
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
          onClick={handleContinuar}
        >
          Continuar
        </Button>
      </section>

      <Dialog
        open={vencimentoDialogOpen}
        onOpenChange={setVencimentoDialogOpen}
      >
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Selecionar o dia de vencimento</DialogTitle>
            <DialogDescription>
              Sempre no dia 5, 10, 15 ou 20, dentro de uma janela de até{" "}
              {LIMITE_DIAS_PRIMEIRA_PARCELA} dias a partir de hoje.
            </DialogDescription>
          </DialogHeader>
          <Calendar
            selected={draftVencimentoData}
            minDate={hoje}
            maxDate={limiteVencimento}
            isDayAllowed={ehDiaVencimentoPermitido}
            onSelect={setDraftVencimentoData}
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setVencimentoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="h-10 rounded-xl font-semibold"
              disabled={!draftVencimentoData}
              onClick={confirmarVencimento}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

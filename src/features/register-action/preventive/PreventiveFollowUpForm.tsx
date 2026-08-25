import { useState } from "react";
import { format } from "date-fns";
import { ChevronRight, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ActionClient,
  ActionParty,
  ActionResult,
} from "@/contexts/action";
import {
  OutcomeOptionList,
  RegisterActionFooter,
  RegisterActionLayout,
  RegisterFormCard,
  RegisterSaveButton,
  RegisterStepIndicator,
} from "@/features/register-action";
import {
  ChannelPicker,
  PaymentForecastField,
  PhonePanel,
  PreventiveRecipientPicker,
  VisitLocationPanel,
  WhatsAppPanel,
  type Channel,
} from "@/features/register-action/preventive/components";
import { getPreventiveOutcomes } from "@/features/register-action/preventive/constants/outcomes";
import { useVisitLocationCheck } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import { getWaTemplates } from "@/features/register-action/preventive/utils/wa-templates";
import { buildPreventiveFollowUpPayload } from "@/features/register-action/utils/map-to-follow-up";
import { useCreateFollowUp } from "@/hooks/useCreateFollowUp";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getFirstName } from "@/lib/user-display";
import { FollowUpParty } from "@/services/followup/followup.types";

type Step = "recipient" | "channel" | "channel_action" | "outcome";

const STEP_TITLES: Record<Step, string> = {
  recipient: "Destinatário",
  channel: "Tipo de contato",
  channel_action: "Ação do contato",
  outcome: "Resultado do contato",
};

function channelActionTitle(
  channel: Channel | null,
  recipientFirstName: string,
): string {
  if (channel === "whatsapp") return "Mensagem WhatsApp";
  if (channel === "phone") return `Ligar para ${recipientFirstName}`;
  if (channel === "visit") return "Verificar localização";
  return STEP_TITLES.channel_action;
}

interface PreventiveFollowUpFormProps {
  client: ActionClient;
  guarantor?: ActionParty | null;
  onBack: () => void;
  onSaved: (result: ActionResult) => void;
}

/**
 * Formulário visual compartilhado pelos fluxos preventivo legado e de
 * follow-up da Carteira. Recebe seus dados por props para não depender de
 * ActionContext nas rotas novas.
 */
export function PreventiveFollowUpForm({
  client,
  guarantor,
  onBack,
  onSaved,
}: PreventiveFollowUpFormProps) {
  const { showToast } = useToast();
  const createFollowUp = useCreateFollowUp();
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState<FollowUpParty | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [paymentForecast, setPaymentForecast] = useState<Date | undefined>();
  const {
    status: locationStatus,
    result: locationCheckResult,
    coords: geoCoords,
    verify: verifyLocationCheck,
    confirmManual,
    reset: resetLocationCheck,
    locationOk,
  } = useVisitLocationCheck({
    contractId: client.id,
    installmentNumber: client.installmentNumber,
    party: recipient ?? FollowUpParty.CLIENT,
  });

  const selectedParty =
    recipient === FollowUpParty.GUARANTOR && guarantor ? guarantor : client;
  const recipientFirstName = getFirstName(selectedParty.name);
  const waTemplates = getWaTemplates({ ...client, name: selectedParty.name });
  const recipientPhone = selectedParty.phone ?? "";
  const recipientAddress = selectedParty.address;
  const pageTitle =
    step === "channel_action"
      ? channelActionTitle(channel, recipientFirstName)
      : STEP_TITLES[step];
  const currentStepIndex =
    step === "recipient"
      ? 0
      : step === "channel"
        ? 1
        : step === "channel_action"
          ? 2
          : 3;
  const saving = createFollowUp.isPending;
  const requiresForecast = outcome === "delay";
  const requiresNote = outcome === "other";
  const canSaveOutcome = !requiresForecast || Boolean(paymentForecast);
  const canSave = canSaveOutcome && (!requiresNote || note.trim().length > 0);

  function handleRecipientChange(party: FollowUpParty) {
    setRecipient(party);
    setChannel(null);
    setOutcome(null);
    setNote("");
    setPaymentForecast(undefined);
    resetLocationCheck();
  }

  function handleChannelChange(nextChannel: Channel) {
    setChannel(nextChannel);
    setOutcome(null);
    setPaymentForecast(undefined);
    resetLocationCheck();
  }

  function handleOutcomeChange(nextOutcome: string) {
    setOutcome(nextOutcome);
    if (nextOutcome !== "delay") setPaymentForecast(undefined);
  }

  function handleContinueToChannelAction() {
    resetLocationCheck();
    setStep("channel_action");
  }

  function handleBackToChannel() {
    resetLocationCheck();
    setStep("channel");
  }

  async function handleSave() {
    if (!channel || !recipient || !canSave) return;

    const includeGeo =
      channel === "visit" &&
      (locationStatus === "confirmed" || locationStatus === "manual") &&
      geoCoords !== null;

    try {
      const payload = buildPreventiveFollowUpPayload({
        contractId: client.id,
        installmentNumber: client.installmentNumber,
        channel,
        party: recipient,
        outcome,
        note,
        paymentForecast:
          outcome === "delay" && paymentForecast
            ? format(paymentForecast, "yyyy-MM-dd")
            : undefined,
        latitude: includeGeo ? geoCoords.latitude : undefined,
        longitude: includeGeo ? geoCoords.longitude : undefined,
      });
      await createFollowUp.mutateAsync(payload);
      onSaved({
        channel,
        outcome: outcome ?? undefined,
        note: note || undefined,
        status: outcome ?? undefined,
      });
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erro ao registrar contato."), {
        variant: "destructive",
      });
    }
  }

  return (
    <RegisterActionLayout
      title={pageTitle}
      client={client}
      onBack={onBack}
      beforeContent={
        <RegisterStepIndicator
          steps={["Destinatário", "Canal", "Ação", "Resultado"]}
          currentStep={currentStepIndex}
          connectorClassName="mx-2 h-px w-6 bg-border"
        />
      }
      footer={
        <RegisterActionFooter>
          {step === "recipient" && (
            <Button
              className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
              disabled={!recipient}
              onClick={() => setStep("channel")}
            >
              Continuar <ChevronRight size={16} />
            </Button>
          )}

          {step === "channel" && (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-5"
                onClick={() => setStep("recipient")}
              >
                Voltar
              </Button>
              <Button
                className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
                disabled={!channel}
                onClick={handleContinueToChannelAction}
              >
                Continuar <ChevronRight size={16} />
              </Button>
            </>
          )}

          {step === "channel_action" && (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-5"
                onClick={handleBackToChannel}
              >
                Voltar
              </Button>
              <Button
                className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
                disabled={channel === "visit" && !locationOk}
                onClick={() => setStep("outcome")}
              >
                {channel === "visit" && !locationOk ? (
                  <>
                    <MapPinOff size={15} />
                    Confirme a localização
                  </>
                ) : (
                  <>
                    Registrar resultado <ChevronRight size={16} />
                  </>
                )}
              </Button>
            </>
          )}

          {step === "outcome" && (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-5"
                onClick={() => setStep("channel_action")}
              >
                Voltar
              </Button>
              <RegisterSaveButton
                saving={saving}
                disabled={!canSave}
                onClick={handleSave}
              />
            </>
          )}
        </RegisterActionFooter>
      }
    >
      <RegisterFormCard>
        {step === "recipient" && (
          <PreventiveRecipientPicker
            value={recipient}
            onChange={handleRecipientChange}
            clientName={client.name}
            guarantor={guarantor}
          />
        )}

        {step === "channel" && (
          <ChannelPicker value={channel} onChange={handleChannelChange} />
        )}

        {step === "channel_action" && channel === "whatsapp" && (
          <WhatsAppPanel
            phone={recipientPhone}
            clientFirstName={recipientFirstName}
            templates={waTemplates}
          />
        )}

        {step === "channel_action" && channel === "phone" && (
          <PhonePanel
            phone={recipientPhone}
            clientFirstName={recipientFirstName}
          />
        )}

        {step === "channel_action" && channel === "visit" && (
          <VisitLocationPanel
            address={recipientAddress}
            addressLabel={`Endereço do ${
              recipient === FollowUpParty.GUARANTOR ? "avalista" : "cliente"
            }`}
            status={locationStatus}
            locationCheckResult={locationCheckResult}
            onVerifyLocation={verifyLocationCheck}
            onConfirmManual={confirmManual}
          />
        )}

        {step === "outcome" && (
          <OutcomeOptionList
            options={getPreventiveOutcomes(channel)}
            value={outcome}
            onChange={handleOutcomeChange}
            prompt={
              channel === "visit"
                ? "Qual foi o resultado da visita?"
                : "Qual foi o resultado do contato?"
            }
            afterOptions={
              requiresForecast ? (
                <PaymentForecastField
                  value={paymentForecast}
                  onChange={setPaymentForecast}
                  invalid={!paymentForecast}
                />
              ) : undefined
            }
            note={{
              value: note,
              onChange: setNote,
              required: requiresNote,
              invalid: requiresNote && note.trim().length === 0,
              hint: requiresNote
                ? "Descreva a situação para registrar outro resultado."
                : undefined,
            }}
            compact
          />
        )}
      </RegisterFormCard>
    </RegisterActionLayout>
  );
}

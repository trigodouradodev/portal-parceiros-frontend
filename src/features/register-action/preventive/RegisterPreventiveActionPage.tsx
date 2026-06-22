import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionContext } from "@/contexts/action";
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
  PhonePanel,
  VisitLocationPanel,
  WhatsAppPanel,
  type Channel,
} from "@/features/register-action/preventive/components";
import { useVisitLocationCheck } from "@/features/register-action/preventive/hooks/useVisitLocationCheck";
import { OUTCOMES } from "@/features/register-action/preventive/constants/outcomes";
import { getWaTemplates } from "@/features/register-action/preventive/utils/wa-templates";
import { buildPreventiveFollowUpPayload } from "@/features/register-action/utils/map-to-follow-up";
import { useCreateFollowUp } from "@/hooks/useCreateFollowUp";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getFirstName } from "@/lib/user-display";

type Step = "channel" | "channel_action" | "outcome";

const STEP_TITLES: Record<Step, string> = {
  channel: "Tipo de contato",
  channel_action: "Ação do contato",
  outcome: "Resultado do contato",
};

function channelActionTitle(channel: Channel | null): string {
  if (channel === "whatsapp") return "Mensagem WhatsApp";
  if (channel === "phone") return "Ligar para o cliente";
  if (channel === "visit") return "Verificar localização";
  return STEP_TITLES.channel_action;
}

export function RegisterPreventiveActionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createFollowUp = useCreateFollowUp();
  const { client, onComplete } = useActionContext();
  const [step, setStep] = useState<Step>("channel");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const handleBack = () => {
    navigate(-1);
  };

  const {
    status: locationStatus,
    result: locationCheckResult,
    coords: geoCoords,
    verify: verifyLocationCheck,
    confirmManual,
    locationOk,
  } = useVisitLocationCheck({
    contractId: client?.id ?? "",
    installmentNumber: client?.installmentNumber ?? 0,
  });

  if (!client) {
    return null;
  }

  const waTemplates = getWaTemplates(client);
  const clientPhone = client.phone ?? "";
  const clientAddress = client.address;
  const clientFirstName = getFirstName(client.name);

  const pageTitle =
    step === "channel_action" ? channelActionTitle(channel) : STEP_TITLES[step];
  const currentStepIndex =
    step === "channel" ? 0 : step === "channel_action" ? 1 : 2;
  const saving = createFollowUp.isPending;
  const canSaveOutcome = step === "outcome" && outcome !== null;

  async function handleSave() {
    if (!channel || !outcome) return;

    const currentClient = client;
    if (!currentClient) return;

    const includeGeo =
      channel === "visit" &&
      locationStatus === "confirmed" &&
      geoCoords !== null;

    try {
      const payload = buildPreventiveFollowUpPayload({
        contractId: currentClient.id,
        installmentNumber: currentClient.installmentNumber,
        channel,
        outcome,
        note,
        latitude: includeGeo ? geoCoords.latitude : undefined,
        longitude: includeGeo ? geoCoords.longitude : undefined,
      });
      await createFollowUp.mutateAsync(payload);
      onComplete({ channel, outcome, note, status: outcome });
      navigate(-1);
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
      onBack={handleBack}
      beforeContent={
        <RegisterStepIndicator
          steps={["Canal", "Ação", "Resultado"]}
          currentStep={currentStepIndex}
          connectorClassName="mx-2 h-px w-6 bg-border"
        />
      }
      footer={
        <RegisterActionFooter>
          {step === "channel" && (
            <Button
              className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
              disabled={!channel}
              onClick={() => setStep("channel_action")}
            >
              Continuar <ChevronRight size={16} />
            </Button>
          )}

          {step === "channel_action" && (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-5"
                onClick={() => setStep("channel")}
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
                disabled={!canSaveOutcome}
                onClick={handleSave}
              />
            </>
          )}
        </RegisterActionFooter>
      }
    >
      <RegisterFormCard>
        {step === "channel" && (
          <ChannelPicker value={channel} onChange={setChannel} />
        )}

        {step === "channel_action" && channel === "whatsapp" && (
          <WhatsAppPanel
            phone={clientPhone}
            clientFirstName={clientFirstName}
            templates={waTemplates}
          />
        )}

        {step === "channel_action" && channel === "phone" && (
          <PhonePanel
            phone={clientPhone}
            clientFirstName={clientFirstName}
            templates={waTemplates}
          />
        )}

        {step === "channel_action" && channel === "visit" && (
          <VisitLocationPanel
            address={clientAddress}
            status={locationStatus}
            locationCheckResult={locationCheckResult}
            onVerifyLocation={verifyLocationCheck}
            onConfirmManual={confirmManual}
          />
        )}

        {step === "outcome" && (
          <OutcomeOptionList
            options={OUTCOMES}
            value={outcome}
            onChange={setOutcome}
            prompt="Qual foi o resultado do contato?"
            note={{ value: note, onChange: setNote }}
            compact
          />
        )}
      </RegisterFormCard>
    </RegisterActionLayout>
  );
}

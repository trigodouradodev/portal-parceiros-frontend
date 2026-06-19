import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionContext } from "@/contexts/action";
import { devPrevActionPayload } from "@/contexts/action/dev-action-mock";
import {
  OutcomeOptionList,
  RegisterActionFooter,
  RegisterActionLayout,
  RegisterFormCard,
  RegisterSaveButton,
  RegisterStepIndicator,
} from "@/features/register-action";
import {
  PrevChannelPicker,
  PrevPhonePanel,
  PrevVisitLocationPanel,
  PrevWhatsAppPanel,
  type PrevChannel,
  type VisitLocationStatus,
} from "@/features/register-action/preventive/components";
import { PREV_OUTCOMES } from "@/features/register-action/preventive/constants/prev-outcomes";
import { buildPrevFollowUpPayload } from "@/features/register-action/utils/map-to-follow-up";
import { getPrevWaTemplates } from "@/features/register-action/preventive/utils/prev-wa-templates";
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

function channelActionTitle(channel: PrevChannel | null): string {
  if (channel === "whatsapp") return "Mensagem WhatsApp";
  if (channel === "phone") return "Ligar para o cliente";
  if (channel === "visit") return "Verificar localização";
  return STEP_TITLES.channel_action;
}

export function RegisterPreventiveActionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createFollowUp = useCreateFollowUp();
  const { client, onComplete, setActionData } =
    useActionContext();
  const [step, setStep] = useState<Step>("channel");
  const [channel, setChannel] = useState<PrevChannel | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [selectedMsg, setSelectedMsg] = useState(0);
  const [locationStatus, setLocationStatus] =
    useState<VisitLocationStatus>("idle");
  const [geoCoords, setGeoCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV && !client) {
      setActionData(devPrevActionPayload(() => {}));
    }
  }, [client, setActionData]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!client) {
    return null;
  }

  const waTemplates = getPrevWaTemplates(client);
  const mockPhone = client.phone ?? "(11) 98765-4321";
  const mockAddress = client.address ?? "Rua das Flores, 42 – Centro";
  const clientFirstName = getFirstName(client.name);

  const pageTitle =
    step === "channel_action" ? channelActionTitle(channel) : STEP_TITLES[step];
  const currentStepIndex =
    step === "channel" ? 0 : step === "channel_action" ? 1 : 2;
  const saving = createFollowUp.isPending;
  const locationOk =
    locationStatus === "confirmed" || locationStatus === "manual";
  const canSaveOutcome = step === "outcome" && outcome !== null;

  function handleCopy(index: number) {
    navigator.clipboard?.writeText(waTemplates[index].message).catch(() => {});
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  function simulateLocationCheck() {
    setLocationStatus("checking");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus("confirmed");
        },
        () => {
          setLocationStatus("not_found");
        },
        { timeout: 5000 },
      );
      return;
    }

    setTimeout(() => {
      setGeoCoords({ latitude: -23.5505, longitude: -46.6333 });
      setLocationStatus(Math.random() > 0.5 ? "confirmed" : "not_found");
    }, 1800);
  }

  async function handleSave() {
    if (!channel || !outcome) return;

    const currentClient = client;
    if (!currentClient) return;

    const includeGeo =
      channel === "visit" &&
      locationStatus === "confirmed" &&
      geoCoords !== null;

    try {
      const payload = buildPrevFollowUpPayload({
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
          <PrevChannelPicker value={channel} onChange={setChannel} />
        )}

        {step === "channel_action" && channel === "whatsapp" && (
          <PrevWhatsAppPanel
            templates={waTemplates}
            selectedIndex={selectedMsg}
            copiedIndex={copied}
            onSelect={setSelectedMsg}
            onCopy={handleCopy}
          />
        )}

        {step === "channel_action" && channel === "phone" && (
          <PrevPhonePanel phone={mockPhone} clientFirstName={clientFirstName} />
        )}

        {step === "channel_action" && channel === "visit" && (
          <PrevVisitLocationPanel
            address={mockAddress}
            status={locationStatus}
            onVerifyLocation={simulateLocationCheck}
            onConfirmManual={() => setLocationStatus("manual")}
          />
        )}

        {step === "outcome" && (
          <OutcomeOptionList
            options={PREV_OUTCOMES}
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

import { ContactToneBadges } from "@/features/register-action/charge/components/ContactToneBadges";
import { GuidanceCard } from "@/features/register-action/components/primitives/contact/GuidanceCard";
import { ActionHint } from "@/features/register-action/components/primitives/contact/ActionHint";
import { CallClientButton } from "@/features/register-action/components/primitives/contact/CallClientButton";
import { ClientPhoneCard } from "@/features/register-action/components/primitives/contact/ClientPhoneCard";
import type { QueueTone } from "@/services/activities/activity.enums";

interface ChargePhoneStepProps {
  queueTone?: QueueTone | string;
  phone: string;
  phoneLabel: string;
  contactFirstName: string;
  callScript: string;
}

export function ChargePhoneStep({
  queueTone,
  phone,
  phoneLabel,
  contactFirstName,
  callScript,
}: ChargePhoneStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <ContactToneBadges queueTone={queueTone} variant="withDescription" />
      <ClientPhoneCard phone={phone} label={phoneLabel} />
      <GuidanceCard title="Roteiro da ligação" body={callScript} />
      <CallClientButton
        phone={phone}
        clientFirstName={contactFirstName}
        size="lg"
      />
      <ActionHint variant="call" />
    </div>
  );
}

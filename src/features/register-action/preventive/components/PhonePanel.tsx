import type { WaTemplate } from "@/features/register-action/types/wa-template";
import { ActionHint } from "@/features/register-action/components/primitives/contact/ActionHint";
import { CallClientButton } from "@/features/register-action/components/primitives/contact/CallClientButton";
import { ClientPhoneCard } from "@/features/register-action/components/primitives/contact/ClientPhoneCard";

interface PhonePanelProps {
  phone: string;
  clientFirstName: string;
  templates: WaTemplate[];
}

export function PhonePanel({ phone, clientFirstName }: PhonePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <ClientPhoneCard phone={phone} />
      <CallClientButton
        phone={phone}
        clientFirstName={clientFirstName}
        size="lg"
      />
      <ActionHint variant="call" />
    </div>
  );
}

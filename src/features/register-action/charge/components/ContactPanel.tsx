import type { WaTemplate } from "@/features/register-action/types/wa-template";
import { useWhatsAppTemplates } from "@/features/register-action/hooks/useWhatsAppTemplates";
import { hasCallablePhone } from "@/lib/contact-actions";
import { CallClientButton } from "@/features/register-action/components/primitives/contact/CallClientButton";
import { ClientPhoneCard } from "@/features/register-action/components/primitives/contact/ClientPhoneCard";
import { OpenWhatsAppButton } from "@/features/register-action/components/primitives/contact/OpenWhatsAppButton";
import { WhatsAppTemplatePicker } from "@/features/register-action/components/primitives/contact/WhatsAppTemplatePicker";

interface ContactPanelProps {
  phone: string;
  clientFirstName: string;
  templates: WaTemplate[];
}

export function ContactPanel({
  phone,
  clientFirstName,
  templates,
}: ContactPanelProps) {
  const { selectedIndex, copiedIndex, setSelectedIndex, handleCopy } =
    useWhatsAppTemplates(templates);
  const callable = hasCallablePhone(phone);
  const showTemplates = callable && templates.length > 0;

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6">
      <ClientPhoneCard phone={phone} truncate />
      <div className="flex gap-2">
        <CallClientButton phone={phone} size="sm" />
        <OpenWhatsAppButton
          phone={phone}
          message={templates[selectedIndex]?.message}
          size="sm"
        />
      </div>
      {showTemplates && (
        <WhatsAppTemplatePicker
          templates={templates}
          clientFirstName={clientFirstName}
          selectedIndex={selectedIndex}
          copiedIndex={copiedIndex}
          onSelect={setSelectedIndex}
          onCopy={handleCopy}
          variant="compact"
        />
      )}
    </div>
  );
}

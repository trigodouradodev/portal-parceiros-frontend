import type { WaTemplate } from "@/features/register-action/types/wa-template";
import { useWhatsAppTemplates } from "@/features/register-action/hooks/useWhatsAppTemplates";
import { hasCallablePhone } from "@/lib/contact-actions";
import { ActionHint } from "@/features/register-action/components/primitives/contact/ActionHint";
import { OpenWhatsAppButton } from "@/features/register-action/components/primitives/contact/OpenWhatsAppButton";
import { WhatsAppTemplatePicker } from "@/features/register-action/components/primitives/contact/WhatsAppTemplatePicker";

interface WhatsAppPanelProps {
  phone: string;
  clientFirstName: string;
  templates: WaTemplate[];
}

export function WhatsAppPanel({ phone, templates }: WhatsAppPanelProps) {
  const { selectedIndex, copiedIndex, setSelectedIndex, handleCopy } =
    useWhatsAppTemplates(templates);
  const callable = hasCallablePhone(phone);
  const showTemplates = callable && templates.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Selecione uma mensagem e envie pelo WhatsApp.
      </p>
      {!callable && (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Telefone não disponível. Não é possível abrir o WhatsApp.
        </p>
      )}
      {showTemplates && (
        <WhatsAppTemplatePicker
          templates={templates}
          selectedIndex={selectedIndex}
          copiedIndex={copiedIndex}
          onSelect={setSelectedIndex}
          onCopy={handleCopy}
          variant="cards"
        />
      )}
      <OpenWhatsAppButton
        phone={phone}
        message={templates[selectedIndex]?.message}
        size="lg"
      />
      <ActionHint variant="whatsapp" />
    </div>
  );
}

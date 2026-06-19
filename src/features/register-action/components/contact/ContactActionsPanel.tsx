import type { WaTemplate } from "@/features/register-action/types/wa-template";
import { useWhatsAppTemplates } from "@/features/register-action/hooks/useWhatsAppTemplates";
import { hasCallablePhone } from "@/lib/contact-actions";
import { ActionHint } from "./ActionHint";
import { CallClientButton } from "./CallClientButton";
import { ClientPhoneCard } from "./ClientPhoneCard";
import { OpenWhatsAppButton } from "./OpenWhatsAppButton";
import { WhatsAppTemplatePicker } from "./WhatsAppTemplatePicker";

type ContactActionsPanelProps = {
  phone: string;
  clientFirstName: string;
  templates: WaTemplate[];
  mode: "combined" | "phone" | "whatsapp";
  layout?: "compact" | "expanded";
};

export function ContactActionsPanel({
  phone,
  clientFirstName,
  templates,
  mode,
  layout = "compact",
}: ContactActionsPanelProps) {
  const { selectedIndex, copiedIndex, setSelectedIndex, handleCopy } =
    useWhatsAppTemplates(templates);
  const callable = hasCallablePhone(phone);
  const isCompact = layout === "compact";
  const buttonSize = isCompact ? "sm" : "lg";
  const showTemplates = callable && templates.length > 0 && mode !== "phone";
  const pickerVariant = isCompact ? "compact" : "cards";

  const content = (
    <>
      {mode !== "whatsapp" && (
        <ClientPhoneCard phone={phone} truncate={isCompact} />
      )}

      {mode === "combined" && (
        <div className="flex gap-2">
          <CallClientButton phone={phone} size={buttonSize} />
          <OpenWhatsAppButton
            phone={phone}
            message={templates[selectedIndex]?.message}
            size={buttonSize}
          />
        </div>
      )}

      {mode === "phone" && (
        <>
          <CallClientButton
            phone={phone}
            clientFirstName={clientFirstName}
            size={buttonSize}
          />
          <ActionHint variant="call" />
        </>
      )}

      {mode === "whatsapp" && (
        <>
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
              variant={pickerVariant}
            />
          )}
          <OpenWhatsAppButton
            phone={phone}
            message={templates[selectedIndex]?.message}
            size={buttonSize}
          />
          <ActionHint variant="whatsapp" />
        </>
      )}

      {mode === "combined" && showTemplates && (
        <WhatsAppTemplatePicker
          templates={templates}
          clientFirstName={clientFirstName}
          selectedIndex={selectedIndex}
          copiedIndex={copiedIndex}
          onSelect={setSelectedIndex}
          onCopy={handleCopy}
          variant={pickerVariant}
        />
      )}
    </>
  );

  if (isCompact && mode === "combined") {
    return (
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6">
        {content}
      </div>
    );
  }

  return <div className="flex flex-col gap-4">{content}</div>;
}
